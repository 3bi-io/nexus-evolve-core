import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const CREDIT_COSTS = {
  'chat': 1,
  'reasoning': 2,
  'creative': 1,
  'learning': 1,
  'knowledge-graph': 3,
  'problem-solving': 2,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { operation, userId, ipAddress, interactionId } = await req.json();

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
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        // No active subscription - treat as free user with 5 daily credits
        const today = new Date().toISOString().split('T')[0];
        
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
        // Has active subscription
        remaining = subscription.credits_remaining;

        if (remaining >= creditCost) {
          allowed = true;
          const newBalance = remaining - creditCost;

          // Update subscription credits
          await supabase
            .from('user_subscriptions')
            .update({ credits_remaining: newBalance })
            .eq('id', subscription.id);

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
      // Hash the IP address for lookup
      const ipHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(ipAddress)
      ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

      const today = new Date().toISOString().split('T')[0];

      // Check if visitor record exists
      const { data: visitor, error: visitorError } = await supabase
        .from('visitor_credits')
        .select('*')
        .eq('ip_hash', ipHash)
        .single();

      if (visitorError || !visitor) {
        // New visitor - create record
        const { data: newVisitor, error: createError } = await supabase
          .from('visitor_credits')
          .insert({
            ip_hash: ipHash,
            ip_encrypted: ipAddress, // In production, encrypt this
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
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let consecutiveDays = visitor.consecutive_days;
        let creditsUsedToday = visitor.credits_used_today;

        // Reset if new day
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

          await supabase
            .from('visitor_credits')
            .update({
              credits_used_today: creditsUsedToday + creditCost,
              last_visit_date: today,
              consecutive_days: consecutiveDays
            })
            .eq('id', visitor.id);

          await supabase.from('credit_transactions').insert({
            visitor_credit_id: visitor.id,
            transaction_type: 'usage',
            credits_amount: -creditCost,
            balance_after: remaining,
            operation_type: operation,
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

