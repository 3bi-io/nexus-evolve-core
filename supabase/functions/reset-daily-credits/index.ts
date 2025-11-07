/**
 * Reset Daily Credits Function
 * Cron job to reset daily credits for visitors and clean up old records
 */

import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('reset-daily-credits', requestId);

  try {
    logger.info('Starting daily credit reset process');

    const supabase = initSupabaseClient();

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Handle visitor credits
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitor_credits')
      .select('*');

    if (visitorsError) {
      throw visitorsError;
    }

    logger.info('Processing visitor records', { count: visitors?.length || 0 });

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
          logger.debug('Reset credits for visitor', { visitorId: visitor.id, streak: visitor.consecutive_days });
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
          logger.debug('Reset streak for visitor', { visitorId: visitor.id, lastVisit });
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
          logger.debug('Cleaned up old visitor record', { visitorId: visitor.id, lastVisit });
        }

      } catch (error) {
        logger.error('Error processing visitor', { visitorId: visitor.id, error });
      }
    }

    // Clean up old rate limit logs (>2 hours)
    try {
      await supabase.rpc('cleanup_rate_limit_logs');
      logger.info('Cleaned up old rate limit logs');
    } catch (error) {
      logger.error('Error cleaning rate limit logs', error);
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

    logger.info('Daily credit reset complete', { 
      reset: visitorReset, 
      streaksReset: visitorStreakReset, 
      cleaned: visitorCleaned 
    });

    return successResponse({
      success: true,
      date: today,
      visitor_credits_reset: visitorReset,
      visitor_streaks_reset: visitorStreakReset,
      visitor_records_cleaned: visitorCleaned
    }, requestId);

  } catch (error) {
    // Log the failure
    const supabase = initSupabaseClient();
    await supabase.from('cron_job_logs').insert({
      job_name: 'reset-daily-credits',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return handleError({
      functionName: 'reset-daily-credits',
      error,
      requestId
    });
  }
});
