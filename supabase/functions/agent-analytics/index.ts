import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { agentId, startDate, endDate } = await req.json();

    // Verify user owns the agent
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Get aggregated analytics
    const { data: dailyStats, error: statsError } = await supabase
      .from('agent_analytics_daily')
      .select('*')
      .eq('agent_id', agentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (statsError) throw statsError;

    // Get tool usage distribution
    const { data: executions, error: execError } = await supabase
      .from('agent_executions')
      .select('tools_used')
      .eq('agent_id', agentId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (execError) throw execError;

    const toolUsage: Record<string, number> = {};
    executions?.forEach(exec => {
      if (exec.tools_used && Array.isArray(exec.tools_used)) {
        exec.tools_used.forEach((tool: string) => {
          toolUsage[tool] = (toolUsage[tool] || 0) + 1;
        });
      }
    });

    // Calculate summary metrics
    const totalExecutions = dailyStats?.reduce((sum, day) => sum + day.execution_count, 0) || 0;
    const avgSuccessRate = dailyStats?.reduce((sum, day) => sum + (day.success_rate || 0), 0) / (dailyStats?.length || 1);
    const avgResponseTime = dailyStats?.reduce((sum, day) => sum + (day.avg_execution_time || 0), 0) / (dailyStats?.length || 1);
    const totalCreditsUsed = dailyStats?.reduce((sum, day) => sum + (day.total_credits_used || 0), 0) || 0;

    // Get recent failures for debugging
    const { data: recentFailures, error: failError } = await supabase
      .from('agent_executions')
      .select('id, input, error_message, created_at')
      .eq('agent_id', agentId)
      .eq('success', false)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .limit(10);

    if (failError) throw failError;

    return new Response(
      JSON.stringify({
        success: true,
        analytics: {
          dailyStats,
          toolUsage,
          summary: {
            totalExecutions,
            avgSuccessRate: Math.round(avgSuccessRate * 100),
            avgResponseTime: Math.round(avgResponseTime),
            totalCreditsUsed
          },
          recentFailures
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in agent-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
