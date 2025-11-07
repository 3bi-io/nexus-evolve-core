/**
 * Execute Scheduled Agent Function
 * Cron job to execute agents based on their schedules
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
  const logger = createLogger('execute-scheduled-agent', requestId);

  try {
    logger.info('Starting scheduled agent execution');

    const supabase = initSupabaseClient();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Find schedules that need to be executed
    const now = new Date().toISOString();
    const { data: schedules, error: schedError } = await supabase
      .from('agent_schedules')
      .select('*, custom_agents(*)')
      .eq('is_active', true)
      .lte('next_execution_at', now);

    if (schedError) throw schedError;

    logger.info('Found schedules to execute', { count: schedules?.length || 0 });

    const results = [];
    for (const schedule of schedules || []) {
      try {
        const { schedule_config } = schedule;
        const prompt = schedule_config.prompt || 'Execute scheduled task';

        logger.info('Executing scheduled agent', { 
          scheduleId: schedule.id, 
          agentId: schedule.agent_id 
        });

        // Execute the agent
        const execResponse = await fetch(`${supabaseUrl}/functions/v1/custom-agent-executor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            agentId: schedule.agent_id,
            userId: schedule.user_id,
            message: prompt
          })
        });

        const execResult = await execResponse.json();

        // Update schedule's next execution time
        let nextExecution = new Date();
        if (schedule.schedule_type === 'cron') {
          // Simple cron parsing (daily at specific time)
          const cronParts = schedule_config.cron?.split(' ') || [];
          if (cronParts.length >= 2) {
            const hour = parseInt(cronParts[1]) || 9;
            nextExecution.setDate(nextExecution.getDate() + 1);
            nextExecution.setHours(hour, 0, 0, 0);
          } else {
            nextExecution.setDate(nextExecution.getDate() + 1); // Default: daily
          }
        }

        await supabase
          .from('agent_schedules')
          .update({
            last_executed_at: now,
            next_execution_at: nextExecution.toISOString()
          })
          .eq('id', schedule.id);

        // Send results based on schedule config
        if (schedule_config.webhook_url) {
          await fetch(schedule_config.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schedule_id: schedule.id,
              agent_id: schedule.agent_id,
              result: execResult,
              executed_at: now
            })
          });
        }

        results.push({
          schedule_id: schedule.id,
          success: true,
          result: execResult
        });

        logger.info('Schedule executed successfully', { scheduleId: schedule.id });

      } catch (error) {
        logger.error('Error executing schedule', { scheduleId: schedule.id, error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        results.push({
          schedule_id: schedule.id,
          success: false,
          error: errorMessage
        });
      }
    }

    logger.info('Scheduled agent execution complete', { executedCount: results.length });

    return successResponse({
      success: true,
      executed: results.length,
      results
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'execute-scheduled-agent',
      error,
      requestId
    });
  }
});
