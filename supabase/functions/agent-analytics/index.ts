/**
 * Agent Analytics Function
 * Provides analytics and metrics for custom agents
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('agent-analytics', requestId);

  try {
    logger.info('Processing agent analytics request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['agentId', 'startDate', 'endDate']);
    validateString(body.agentId, 'agentId');
    validateString(body.startDate, 'startDate');
    validateString(body.endDate, 'endDate');

    const { agentId, startDate, endDate } = body;

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

    logger.info('Fetching analytics data', { agentId, startDate, endDate });

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

    logger.info('Analytics data retrieved', { 
      totalExecutions, 
      avgSuccessRate, 
      failuresCount: recentFailures?.length || 0 
    });

    return successResponse({
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
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'agent-analytics',
      error,
      requestId
    });
  }
});
