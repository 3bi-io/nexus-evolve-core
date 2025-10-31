import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts';

const SECONDS_PER_CREDIT = 300; // 1 credit = 300 seconds (5 minutes)

// Helper to hash IP address
const hashIP = async (ip: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting - 100 requests per hour per IP/user
    const clientIP = getClientIP(req);
    const body = await req.json();
    let { action, userId, ipAddress, sessionId, usageSessionId, route } = body;
    
    // If ipAddress is 'client', extract real IP from headers
    if (ipAddress === 'client') {
      ipAddress = clientIP;
    }
    
    const identifier = userId || clientIP;
    
    const rateLimit = await checkRateLimit({
      maxRequests: 100,
      windowMinutes: 60,
      identifier,
    });

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${identifier}`);
      return createRateLimitResponse(rateLimit, corsHeaders);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!action || !['start', 'stop', 'check', 'check_credits_only'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Valid action (start/stop/check/check_credits_only) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // START SESSION
    if (action === 'start') {
      let hasCredits = false;
      let remainingCredits = 0;
      let remainingSeconds = 0;
      let visitorCreditId = null;
      let userIdForSession = null;

      // AUTHENTICATED USER
      if (userId) {
        // Check if user is super admin - they have unlimited usage
        const { data: roleCheck, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: userId, 
            _role: 'super_admin' 
          });

        if (!roleError && roleCheck) {
          // Super admin has unlimited credits
          hasCredits = true;
          remainingCredits = 999999;
          remainingSeconds = 999999 * SECONDS_PER_CREDIT;
          userIdForSession = userId;
        } else {
          // Check authenticated user subscription
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('credits_remaining')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          if (subscription && subscription.credits_remaining > 0) {
            hasCredits = true;
            remainingCredits = subscription.credits_remaining;
            remainingSeconds = remainingCredits * SECONDS_PER_CREDIT;
            userIdForSession = userId;
          }
        }
      } 
      // ANONYMOUS VISITOR
      else if (ipAddress) {
        const ipHash = await hashIP(ipAddress);
        const today = new Date().toISOString().split('T')[0];

        console.log(`[START] Looking up visitor by IP hash for date: ${today}`);

        // Get visitor by ip_hash only (ignore date to handle rollovers)
        const { data: existingVisitor, error: lookupError } = await supabase
          .from('visitor_credits')
          .select('*')
          .eq('ip_hash', ipHash)
          .maybeSingle();

        if (lookupError) {
          console.error('[START] Error looking up visitor:', lookupError);
        }

        if (existingVisitor) {
          console.log(`[START] Found existing visitor, last visit: ${existingVisitor.last_visit_date}`);
          
          // Check if it's a new day - need to reset credits
          if (existingVisitor.last_visit_date !== today) {
            console.log('[START] New day detected, resetting credits');
            
            const { data: updatedVisitor, error: updateError } = await supabase
              .from('visitor_credits')
              .update({
                last_visit_date: today,
                credits_used_today: 0,
                consecutive_days: existingVisitor.consecutive_days + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingVisitor.id)
              .select()
              .single();

            if (updateError) {
              console.error('[START] Failed to update visitor for new day:', updateError);
            } else if (updatedVisitor) {
              console.log('[START] Successfully reset credits for new day');
              hasCredits = true;
              remainingCredits = updatedVisitor.daily_credits;
              remainingSeconds = remainingCredits * SECONDS_PER_CREDIT;
              visitorCreditId = updatedVisitor.id;
            }
          } else {
            // Same day - check remaining credits
            const creditsRemaining = existingVisitor.daily_credits - existingVisitor.credits_used_today;
            console.log(`[START] Same day, remaining credits: ${creditsRemaining}`);
            
            if (creditsRemaining > 0) {
              hasCredits = true;
              remainingCredits = creditsRemaining;
              remainingSeconds = creditsRemaining * SECONDS_PER_CREDIT;
              visitorCreditId = existingVisitor.id;
            }
          }
        } else {
          // First-time visitor - create new record
          console.log('[START] New visitor, creating record');
          
          // Encrypt IP address
          const { data: encryptedIP, error: encryptError } = await supabase
            .rpc('encrypt_ip', { 
              ip_address: ipAddress,
              encryption_key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            });

          if (encryptError) {
            console.error('[START] Failed to encrypt IP:', encryptError);
          }

          const { data: newVisitor, error: insertError } = await supabase
            .from('visitor_credits')
            .insert({
              ip_hash: ipHash,
              ip_encrypted: encryptedIP || 'encrypted',
              daily_credits: 5,
              credits_used_today: 0,
              last_visit_date: today,
              consecutive_days: 1
            })
            .select()
            .single();

          if (insertError) {
            console.error('[START] Failed to create visitor record:', insertError);
          } else if (newVisitor) {
            console.log('[START] Successfully created new visitor');
            hasCredits = true;
            remainingCredits = 5;
            remainingSeconds = 5 * SECONDS_PER_CREDIT;
            visitorCreditId = newVisitor.id;
          }
        }
      }

      if (!hasCredits) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: userId 
              ? 'No credits available. Please upgrade your plan.'
              : 'Daily credit limit reached. Sign up for more credits!',
            allowed: false,
            remainingCredits: 0,
            remainingSeconds: 0
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create usage session
      const { data: usageSession, error: sessionError } = await supabase
        .from('usage_sessions')
        .insert({
          user_id: userIdForSession,
          visitor_credit_id: visitorCreditId,
          session_id: sessionId,
          is_active: true,
          metadata: { 
            route: route || 'unknown',
            started_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      return new Response(
        JSON.stringify({
          success: true,
          allowed: true,
          sessionId: usageSession.id,
          remainingCredits,
          remainingSeconds,
          startedAt: usageSession.started_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STOP SESSION
    if (action === 'stop') {
      const checkUsageSessionId = usageSessionId || sessionId;
      
      if (!checkUsageSessionId) {
        return new Response(
          JSON.stringify({ error: 'sessionId or usageSessionId required for stop action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the active session
      const { data: session, error: fetchError } = await supabase
        .from('usage_sessions')
        .select('*')
        .eq('id', checkUsageSessionId)
        .eq('is_active', true)
        .single();

      if (fetchError || !session) {
        return new Response(
          JSON.stringify({ error: 'Active session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate elapsed time
      const startedAt = new Date(session.started_at);
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      
      // Calculate credits to deduct (round up)
      const creditsToDeduct = Math.ceil(elapsedSeconds / SECONDS_PER_CREDIT);

      // Deduct credits
      if (session.user_id) {
        // Check if user is super admin - they don't get charged
        const { data: roleCheck, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: session.user_id, 
            _role: 'super_admin' 
          });

        const isSuperAdmin = !roleError && roleCheck;

        if (!isSuperAdmin) {
          // Authenticated user (non-admin)
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('credits_remaining')
            .eq('user_id', session.user_id)
            .eq('status', 'active')
            .single();

          if (subscription) {
            const newBalance = Math.max(0, subscription.credits_remaining - creditsToDeduct);
            
            await supabase
              .from('user_subscriptions')
              .update({ credits_remaining: newBalance })
              .eq('user_id', session.user_id);

            // Log transaction
            await supabase.from('credit_transactions').insert({
              user_id: session.user_id,
              transaction_type: 'usage',
              credits_amount: -creditsToDeduct,
              balance_after: newBalance,
              operation_type: 'time_usage',
            metadata: { 
              usage_session_id: checkUsageSessionId,
                elapsed_seconds: elapsedSeconds
              }
            });
          }
        } else {
          // Super admin - log session but don't deduct credits
          await supabase.from('credit_transactions').insert({
            user_id: session.user_id,
            transaction_type: 'usage',
            credits_amount: 0,
            balance_after: 999999,
            operation_type: 'time_usage_admin',
            metadata: { 
              usage_session_id: checkUsageSessionId,
              elapsed_seconds: elapsedSeconds,
              super_admin: true
            }
          });
        }
      } else if (session.visitor_credit_id) {
        // Visitor
        const { data: visitor } = await supabase
          .from('visitor_credits')
          .select('*')
          .eq('id', session.visitor_credit_id)
          .single();

        if (visitor) {
          const newUsed = Math.min(visitor.daily_credits, visitor.credits_used_today + creditsToDeduct);
          
          await supabase
            .from('visitor_credits')
            .update({ credits_used_today: newUsed })
            .eq('id', session.visitor_credit_id);

          // Log transaction
          await supabase.from('credit_transactions').insert({
            visitor_credit_id: session.visitor_credit_id,
            transaction_type: 'usage',
            credits_amount: -creditsToDeduct,
            balance_after: visitor.daily_credits - newUsed,
            operation_type: 'time_usage',
            metadata: { 
              usage_session_id: checkUsageSessionId,
              elapsed_seconds: elapsedSeconds
            }
          });
        }
      }

      // Update session
      await supabase
        .from('usage_sessions')
        .update({
          ended_at: now.toISOString(),
          elapsed_seconds: elapsedSeconds,
          credits_deducted: creditsToDeduct,
          is_active: false
        })
        .eq('id', checkUsageSessionId);

      return new Response(
        JSON.stringify({
          success: true,
          elapsedSeconds,
          creditsDeducted: creditsToDeduct
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK CREDITS ONLY (no session required)
    if (action === 'check_credits_only') {
      let remainingCredits = 0;
      
      // AUTHENTICATED USER
      if (userId) {
        // Check if user is super admin
        const { data: roleCheck, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: userId, 
            _role: 'super_admin' 
          });

        if (!roleError && roleCheck) {
          remainingCredits = 999999; // Unlimited for super admin
        } else {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('credits_remaining')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();
          
          if (subscription) {
            remainingCredits = subscription.credits_remaining;
          } else {
            // Free user - check daily usage
            const today = new Date().toISOString().split('T')[0];
            const { data: transactions } = await supabase
              .from('credit_transactions')
              .select('credits_amount')
              .eq('user_id', userId)
              .gte('created_at', `${today}T00:00:00`)
              .eq('transaction_type', 'usage');
            
            const usedToday = transactions?.reduce((sum, t) => sum + Math.abs(t.credits_amount), 0) || 0;
            remainingCredits = Math.max(0, 5 - usedToday);
          }
        }
      } 
      // ANONYMOUS VISITOR
      else if (ipAddress) {
        const ipHash = await hashIP(ipAddress);
        const today = new Date().toISOString().split('T')[0];
        
        const { data: visitor } = await supabase
          .from('visitor_credits')
          .select('*')
          .eq('ip_hash', ipHash)
          .maybeSingle();
        
        if (visitor) {
          // Reset if new day
          if (visitor.last_visit_date !== today) {
            remainingCredits = 5; // Fresh daily credits
          } else {
            remainingCredits = Math.max(0, visitor.daily_credits - visitor.credits_used_today);
          }
        } else {
          remainingCredits = 5; // New visitor gets full daily credits
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          remainingCredits,
          dailyLimit: 5
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK SESSION
    if (action === 'check') {
      const checkSessionId = usageSessionId;
      
      if (!checkSessionId) {
        return new Response(
          JSON.stringify({ error: 'usageSessionId required for check action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: session } = await supabase
        .from('usage_sessions')
        .select('*')
        .eq('id', checkSessionId)
        .single();

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate current elapsed time
      const startedAt = new Date(session.started_at);
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

      // Get remaining credits
      let remainingCredits = 0;
      if (session.user_id) {
        // Check if user is super admin
        const { data: roleCheck, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: session.user_id, 
            _role: 'super_admin' 
          });

        if (!roleError && roleCheck) {
          remainingCredits = 999999; // Unlimited for super admin
        } else {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('credits_remaining')
            .eq('user_id', session.user_id)
            .eq('status', 'active')
            .single();
          remainingCredits = subscription?.credits_remaining || 0;
        }
      } else if (session.visitor_credit_id) {
        const { data: visitor } = await supabase
          .from('visitor_credits')
          .select('*')
          .eq('id', session.visitor_credit_id)
          .single();
        remainingCredits = visitor ? visitor.daily_credits - visitor.credits_used_today : 0;
      }

      const remainingSeconds = (remainingCredits * SECONDS_PER_CREDIT) - elapsedSeconds;

      return new Response(
        JSON.stringify({
          isActive: session.is_active,
          elapsedSeconds,
          remainingSeconds: Math.max(0, remainingSeconds),
          remainingCredits
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default response for unknown actions
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in manage-usage-session:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
