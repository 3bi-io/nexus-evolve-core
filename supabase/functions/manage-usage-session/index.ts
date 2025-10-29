import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId, ipAddress, sessionId, usageSessionId, route } = await req.json();

    if (!action || (action !== 'start' && action !== 'stop' && action !== 'check')) {
      return new Response(
        JSON.stringify({ error: 'Valid action (start/stop/check) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // START SESSION
    if (action === 'start') {
      // Check if user has credits available
      let hasCredits = false;
      let remainingCredits = 0;
      let remainingSeconds = 0;

      if (userId) {
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
        }
      } else if (ipAddress) {
        // Check visitor credits
        const ipHash = await hashIP(ipAddress);
        const { data: visitor } = await supabase
          .from('visitor_credits')
          .select('*')
          .eq('ip_hash', ipHash)
          .single();

        if (visitor) {
          const remaining = visitor.daily_credits - visitor.credits_used_today;
          if (remaining > 0) {
            hasCredits = true;
            remainingCredits = remaining;
            remainingSeconds = remaining * SECONDS_PER_CREDIT;
          }
        }
      }

      if (!hasCredits) {
        return new Response(
          JSON.stringify({ 
            error: 'No credits available',
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
          user_id: userId || null,
          visitor_credit_id: ipAddress ? (await supabase.from('visitor_credits').select('id').eq('ip_hash', await hashIP(ipAddress)).single()).data?.id : null,
          session_id: sessionId,
          is_active: true,
          metadata: { 
            ip_address: ipAddress || null,
            route: route || 'unknown',
            started_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      return new Response(
        JSON.stringify({
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
      const { usageSessionId } = await req.json();
      
      if (!usageSessionId) {
        return new Response(
          JSON.stringify({ error: 'usageSessionId required for stop action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the active session
      const { data: session, error: fetchError } = await supabase
        .from('usage_sessions')
        .select('*')
        .eq('id', usageSessionId)
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
        // Authenticated user
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
              usage_session_id: usageSessionId,
              elapsed_seconds: elapsedSeconds
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
              usage_session_id: usageSessionId,
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
        .eq('id', usageSessionId);

      return new Response(
        JSON.stringify({
          success: true,
          elapsedSeconds,
          creditsDeducted: creditsToDeduct
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK SESSION
    if (action === 'check') {
      const { usageSessionId: checkSessionId } = await req.json();
      
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
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('credits_remaining')
          .eq('user_id', session.user_id)
          .eq('status', 'active')
          .single();
        remainingCredits = subscription?.credits_remaining || 0;
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
