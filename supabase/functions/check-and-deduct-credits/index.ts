import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { performSecurityCheck } from '../_shared/advanced-security.ts';

const CREDIT_COSTS = {
  'chat': 1,
  'reasoning': 2,
  'creative': 1,
  'learning': 1,
  'knowledge-graph': 3,
  'problem-solving': 2,
};

// Helper to get current UTC date string
const getUTCDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper to hash IP address with salt
const hashIP = async (ip: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(ip + 'oneiros-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('IP_ENCRYPTION_KEY') || 'default-key-change-in-production';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { operation, userId, ipAddress, interactionId } = await req.json();

    // Perform comprehensive security checks
    const securityCheck = await performSecurityCheck(req, supabase, {
      checkGeo: true,
      checkBot: true,
      checkBruteForce: false
    });

    // Block if security check fails
    if (!securityCheck.allowed) {
      console.log('Security check failed:', securityCheck.reason);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          remaining: 0, 
          creditCost: 0,
          error: securityCheck.reason || 'Access denied'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log suspicious activity
    if (securityCheck.suspicionScore > 40) {
      const ipHash = await hashIP(ipAddress || 'unknown');
      await supabase.from('security_events').insert({
        event_type: 'suspicious_pattern',
        severity: securityCheck.suspicionScore > 60 ? 'medium' : 'low',
        ip_hash: ipHash,
        user_id: userId || null,
        details: { 
          operation, 
          suspicion_score: securityCheck.suspicionScore,
          country: securityCheck.countryCode,
          risk_level: securityCheck.riskLevel
        },
        blocked: false
      } as any);
    }

    if (!operation) {
      return new Response(
        JSON.stringify({ error: 'Operation type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditCost = CREDIT_COSTS[operation as keyof typeof CREDIT_COSTS] || 1;
    let allowed = false;
    let remaining = 0;
    let suggestedTier = null;
    let isAnonymous = !userId;

    // Handle authenticated users
    if (userId) {
      // Check if user is super admin - they have unlimited usage
      const { data: isSuperAdmin, error: roleError } = await supabase
        .rpc('has_role', { 
          _user_id: userId, 
          _role: 'super_admin' 
        });

      if (!roleError && isSuperAdmin) {
        // Super admin has unlimited credits
        return new Response(
          JSON.stringify({
            allowed: true,
            remaining: 999999,
            creditCost: 0,
            suggestedTier: null,
            isAnonymous: false,
            isSuperAdmin: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use row-level locking to prevent concurrent request race conditions
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        // No active subscription - treat as free user with 5 daily credits
        const today = getUTCDateString();
        
        // Check if user has used free credits today
        const { data: todayTransactions } = await supabase
          .from('credit_transactions')
          .select('credits_amount')
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00`)
          .eq('transaction_type', 'usage');

        const usedToday = todayTransactions?.reduce((sum, t) => sum + Math.abs(t.credits_amount), 0) || 0;
        remaining = Math.max(0, 5 - usedToday);

        if (remaining >= creditCost) {
          allowed = true;
          remaining -= creditCost;

          // Log transaction
          await supabase.from('credit_transactions').insert({
            user_id: userId,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: remaining,
            operation_type: operation,
            interaction_id: interactionId,
            metadata: { free_tier: true }
          });
        } else {
          suggestedTier = 'starter';
        }
      } else {
        // Phase 4.1 & 4.2: Handle unlimited tiers (enterprise & professional_unlimited)
        const unlimitedTiers = ['enterprise', 'professional_unlimited'];
        if (unlimitedTiers.includes(subscription.subscription_tiers.tier_name)) {
          // Soft cap check: 1000 interactions per day for unlimited users
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const { count: todayUsage } = await supabase
            .from('credit_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('transaction_type', 'usage')
            .gte('created_at', todayStart.toISOString());

          if (todayUsage && todayUsage >= 1000) {
            return new Response(
              JSON.stringify({ 
                error: 'Daily soft cap reached (1000 interactions/day). Contact support for higher limits.',
                allowed: false,
                remaining: 0,
                soft_cap_reached: true
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Log the interaction but don't deduct
          await supabase.from('credit_transactions').insert({
            user_id: userId,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: 999999, // Unlimited marker
            operation_type: operation,
            interaction_id: interactionId,
            metadata: { unlimited_tier: true, tier: subscription.subscription_tiers.tier_name }
          });

          return new Response(
            JSON.stringify({ 
              allowed: true,
              unlimited: true,
              remaining: 999999,
              creditCost: 0,
              suggestedTier: null,
              isAnonymous: false,
              daily_usage: todayUsage || 0,
              message: 'Unlimited plan - no deduction needed'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Has active subscription with limited credits
        remaining = subscription.credits_remaining;

        if (remaining >= creditCost) {
          allowed = true;
          const newBalance = remaining - creditCost;

          // Update subscription credits with row lock to prevent race conditions
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ credits_remaining: newBalance })
            .eq('id', subscription.id);

          if (updateError) {
            throw new Error(`Failed to update credits: ${updateError.message}`);
          }

          // Log transaction
          await supabase.from('credit_transactions').insert({
            user_id: userId,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: newBalance,
            operation_type: operation,
            interaction_id: interactionId,
            metadata: { 
              tier: subscription.subscription_tiers.tier_name,
              billing_cycle: subscription.billing_cycle
            }
          });

          remaining = newBalance;

          // Suggest upgrade if running low
          const usagePercentage = (newBalance / subscription.credits_total) * 100;
          if (usagePercentage < 20) {
            if (subscription.subscription_tiers.tier_name === 'starter') {
              suggestedTier = 'professional';
            } else if (subscription.subscription_tiers.tier_name === 'professional') {
              suggestedTier = 'enterprise';
            }
          }
        } else {
          // Out of credits - suggest upgrade
          if (subscription.subscription_tiers.tier_name === 'starter') {
            suggestedTier = 'professional';
          } else if (subscription.subscription_tiers.tier_name === 'professional') {
            suggestedTier = 'enterprise';
          }
        }
      }
    } 
    // Handle anonymous users (IP-based)
    else if (ipAddress) {
      // Check rate limiting first (100 requests per hour)
      const ipHash = await hashIP(ipAddress);
      
      const { data: rateLimitResult, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', { 
          p_ip_hash: ipHash,
          p_max_requests: 100,
          p_window_minutes: 60
        });

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
      }

      if (rateLimitResult && !rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded', 
            allowed: false,
            remaining: 0,
            resetAt: rateLimitResult.reset_at,
            message: `Too many requests. Limit: ${rateLimitResult.limit} requests per hour. Try again after ${rateLimitResult.reset_at}`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const today = getUTCDateString();

      // Check if visitor record exists
      const { data: visitor } = await supabase
        .from('visitor_credits')
        .select('*')
        .eq('ip_hash', ipHash)
        .maybeSingle();

      if (!visitor) {
        // New visitor - create record with encrypted IP
        const { data: encryptedIP } = await supabase
          .rpc('encrypt_ip', { 
            ip_address: ipAddress,
            encryption_key: encryptionKey
          });

        const { data: newVisitor, error: createError } = await supabase
          .from('visitor_credits')
          .insert({
            ip_hash: ipHash,
            ip_encrypted: encryptedIP,
            daily_credits: 5,
            credits_used_today: 0,
            last_visit_date: today,
            consecutive_days: 1
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        if (newVisitor.daily_credits >= creditCost) {
          allowed = true;
          remaining = newVisitor.daily_credits - creditCost;

          await supabase
            .from('visitor_credits')
            .update({ credits_used_today: creditCost })
            .eq('id', newVisitor.id);

          await supabase.from('credit_transactions').insert({
            visitor_credit_id: newVisitor.id,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: remaining,
            operation_type: operation,
            metadata: { ip_hash: ipHash }
          });
        } else {
          suggestedTier = 'starter';
        }
      } else {
        // Existing visitor
        const lastVisit = visitor.last_visit_date;
        
        // Calculate yesterday in UTC
        const now = new Date();
        const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let consecutiveDays = visitor.consecutive_days;
        let creditsUsedToday = visitor.credits_used_today;

        // Reset if new day (comparing UTC dates)
        if (lastVisit !== today) {
          if (lastVisit === yesterdayStr) {
            // Consecutive day visit - maintain streak
            consecutiveDays += 1;
          } else {
            // Missed a day - reset streak
            consecutiveDays = 1;
          }
          creditsUsedToday = 0;
        }

        remaining = visitor.daily_credits - creditsUsedToday;

        if (remaining >= creditCost) {
          allowed = true;
          remaining -= creditCost;

          const { error: updateError } = await supabase
            .from('visitor_credits')
            .update({
              credits_used_today: creditsUsedToday + creditCost,
              last_visit_date: today,
              consecutive_days: consecutiveDays
            })
            .eq('id', visitor.id);

          if (updateError) {
            throw new Error(`Failed to update visitor credits: ${updateError.message}`);
          }

          await supabase.from('credit_transactions').insert({
            visitor_credit_id: visitor.id,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: remaining,
            operation_type: operation,
            interaction_id: interactionId,
            metadata: { 
              ip_hash: ipHash,
              consecutive_days: consecutiveDays
            }
          });
        } else {
          suggestedTier = 'starter';
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Either userId or ipAddress is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        allowed,
        remaining,
        creditCost,
        suggestedTier,
        isAnonymous
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-and-deduct-credits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

