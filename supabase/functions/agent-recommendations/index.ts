/**
 * Agent Recommendations Function
 * Generates improvement suggestions for custom agents based on performance
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
  const logger = createLogger('agent-recommendations', requestId);

  try {
    logger.info('Processing agent recommendations request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['agentId']);
    validateString(body.agentId, 'agentId');

    const { agentId } = body;

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    logger.info('Agent found, analyzing performance', { agentId });

    // Get agent's performance metrics
    const { data: analytics } = await supabase
      .from('agent_analytics_daily')
      .select('*')
      .eq('agent_id', agentId)
      .order('date', { ascending: false })
      .limit(30);

    const avgSuccessRate = analytics?.reduce((sum, day) => sum + (day.success_rate || 0), 0) / (analytics?.length || 1);
    const avgResponseTime = analytics?.reduce((sum, day) => sum + (day.avg_execution_time || 0), 0) / (analytics?.length || 1);

    const suggestions = [];

    // Temperature recommendation
    if (avgResponseTime > 5000 && agent.temperature > 0.7) {
      suggestions.push({
        suggestion_type: 'temperature',
        suggestion: 'Lower temperature to 0.5',
        reasoning: 'Your agent has slow response times. Lower temperature can improve speed while maintaining quality.',
        confidence_score: 0.8
      });
    }

    if (avgSuccessRate < 0.7 && agent.temperature < 0.5) {
      suggestions.push({
        suggestion_type: 'temperature',
        suggestion: 'Increase temperature to 0.7',
        reasoning: 'Your success rate is below average. Higher temperature can improve response creativity and problem-solving.',
        confidence_score: 0.75
      });
    }

    // Tool recommendations
    const enabledTools = agent.tools || [];
    if (!enabledTools.includes('web_search') && agent.description?.toLowerCase().includes('research')) {
      suggestions.push({
        suggestion_type: 'tools',
        suggestion: 'Enable web_search tool',
        reasoning: 'Your agent seems research-focused but doesn\'t have web search enabled.',
        confidence_score: 0.85
      });
    }

    if (!enabledTools.includes('semantic_search') && agent.knowledge_base_ids?.length > 0) {
      suggestions.push({
        suggestion_type: 'tools',
        suggestion: 'Enable semantic_search tool',
        reasoning: 'You have knowledge base content but semantic search is not enabled.',
        confidence_score: 0.9
      });
    }

    // Model recommendation
    if (avgResponseTime > 8000 && agent.model === 'google/gemini-2.5-pro') {
      suggestions.push({
        suggestion_type: 'model',
        suggestion: 'Switch to claude-sonnet-4-5',
        reasoning: 'Sonnet is significantly faster while maintaining high quality for most tasks.',
        confidence_score: 0.85
      });
    }

    // Prompt improvement
    if (agent.system_prompt && agent.system_prompt.length < 100) {
      suggestions.push({
        suggestion_type: 'prompt',
        suggestion: 'Expand your system prompt',
        reasoning: 'Short system prompts often lead to inconsistent behavior. Add more context about the agent\'s role and capabilities.',
        confidence_score: 0.7
      });
    }

    // Store suggestions
    for (const suggestion of suggestions) {
      await supabase
        .from('agent_improvement_suggestions')
        .insert({
          agent_id: agentId,
          ...suggestion
        });
    }

    logger.info('Generated recommendations', { count: suggestions.length });

    return successResponse({
      success: true,
      suggestions
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'agent-recommendations',
      error,
      requestId
    });
  }
});
