import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find schedules that need to be executed
    const now = new Date().toISOString();
    const { data: schedules, error: schedError } = await supabase
      .from('agent_schedules')
      .select('*, custom_agents(*)')
      .eq('is_active', true)
      .lte('next_execution_at', now);

    if (schedError) throw schedError;

    console.log(`Found ${schedules?.length || 0} schedules to execute`);

    const results = [];
    for (const schedule of schedules || []) {
      try {
        const { schedule_config } = schedule;
        const prompt = schedule_config.prompt || 'Execute scheduled task';

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

      } catch (error) {
        console.error(`Error executing schedule ${schedule.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        results.push({
          schedule_id: schedule.id,
          success: false,
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        executed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in execute-scheduled-agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
