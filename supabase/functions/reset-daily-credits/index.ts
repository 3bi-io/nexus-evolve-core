import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily credit reset process...');

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Reset authenticated users with no subscription (free tier - 5 daily credits)
    const { data: freeUsers, error: freeUsersError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (freeUsersError) {
      console.error('Error fetching subscriptions:', freeUsersError);
    }

    // Get IDs of users with active subscriptions
    const subscribedUserIds = freeUsers?.map(s => s.user_id) || [];

    // Note: Free users' credits are handled dynamically in check-and-deduct-credits
    // based on daily transaction history, so no reset needed here

    // 2. Handle visitor credits - reset for consecutive day visitors
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitor_credits')
      .select('*');

    if (visitorsError) {
      throw visitorsError;
    }

    console.log(`Found ${visitors?.length || 0} visitor records to process`);

    let visitorReset = 0;
    let visitorStreakReset = 0;
    let visitorCleaned = 0;

    for (const visitor of visitors || []) {
      try {
        const lastVisit = visitor.last_visit_date;

        // Reset credits if they visited yesterday (consecutive day)
        if (lastVisit === yesterdayStr) {
          await supabase
            .from('visitor_credits')
            .update({
              credits_used_today: 0,
              consecutive_days: visitor.consecutive_days,
              updated_at: new Date().toISOString()
            })
            .eq('id', visitor.id);

          visitorReset++;
          console.log(`Reset credits for visitor ${visitor.id}, streak: ${visitor.consecutive_days} days`);
        } 
        // Reset streak if they missed a day
        else if (lastVisit < yesterdayStr) {
          await supabase
            .from('visitor_credits')
            .update({
              credits_used_today: 0,
              consecutive_days: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', visitor.id);

          visitorStreakReset++;
          console.log(`Reset streak for visitor ${visitor.id} (last visit: ${lastVisit})`);
        }

        // Clean up old visitor records (>30 days per GDPR compliance)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        if (lastVisit < thirtyDaysAgoStr) {
          await supabase
            .from('visitor_credits')
            .delete()
            .eq('id', visitor.id);

          visitorCleaned++;
          console.log(`Cleaned up old visitor record ${visitor.id} (last visit: ${lastVisit})`);
        }

      } catch (error) {
        console.error(`Error processing visitor ${visitor.id}:`, error);
      }
    }

    // 3. Clean up old rate limit logs (>2 hours)
    try {
      await supabase.rpc('cleanup_rate_limit_logs');
      console.log('Cleaned up old rate limit logs');
    } catch (error) {
      console.error('Error cleaning rate limit logs:', error);
    }

    // Log the cron job execution
    await supabase.from('cron_job_logs').insert({
      job_name: 'reset-daily-credits',
      status: 'success',
      metrics: {
        date: today,
        visitor_credits_reset: visitorReset,
        visitor_streaks_reset: visitorStreakReset,
        visitor_records_cleaned: visitorCleaned,
        total_visitors: visitors?.length || 0
      }
    });

    console.log(`Daily credit reset complete. Reset: ${visitorReset}, Streaks broken: ${visitorStreakReset}, Cleaned: ${visitorCleaned}`);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        visitor_credits_reset: visitorReset,
        visitor_streaks_reset: visitorStreakReset,
        visitor_records_cleaned: visitorCleaned
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reset-daily-credits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Log the failure
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from('cron_job_logs').insert({
      job_name: 'reset-daily-credits',
      status: 'failed',
      error_message: errorMessage
    });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
