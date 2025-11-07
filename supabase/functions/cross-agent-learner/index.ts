/**
 * Cross-Agent Learner Function
 * Manages shared learning across multiple specialized agents
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateEnum, validateNumber } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('cross-agent-learner', requestId);

  try {
    logger.info('Processing cross-agent learning request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['action']);
    validateString(body.action, 'action');
    validateEnum(body.action, 'action', ['record', 'get_shared_learnings', 'analyze_best_practices']);

    const { action, agentType, learningEvent, successScore, context } = body;

    if (action === 'record') {
      validateRequiredFields(body, ['agentType', 'learningEvent', 'successScore']);
      validateString(agentType, 'agentType');
      validateString(learningEvent, 'learningEvent');
      validateNumber(successScore, 'successScore', { min: 0, max: 1 });

      // Record a learning event
      const { data: learning, error } = await supabase
        .from('agent_learning_network')
        .insert({
          user_id: user.id,
          agent_type: agentType,
          learning_event: learningEvent,
          success_score: successScore,
          context: context || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Share high-value learnings to other agents
      if (successScore > 0.8) {
        const allAgents = ['reasoning', 'creative', 'learning', 'coordinator', 'general'];
        const otherAgents = allAgents.filter(a => a !== agentType);
        
        await supabase
          .from('agent_learning_network')
          .update({ shared_to_agents: otherAgents })
          .eq('id', learning.id);

        logger.info('High-value learning shared', { from: agentType, to: otherAgents });
      }

      return successResponse({ success: true, learning }, requestId);
    }

    if (action === 'get_shared_learnings') {
      validateRequiredFields(body, ['agentType']);
      validateString(agentType, 'agentType');

      // Get learnings shared to this agent
      const { data: learnings, error } = await supabase
        .from('agent_learning_network')
        .select('*')
        .eq('user_id', user.id)
        .contains('shared_to_agents', [agentType])
        .order('success_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      logger.info('Shared learnings retrieved', { agentType, count: learnings?.length || 0 });
      return successResponse({ learnings }, requestId);
    }

    if (action === 'analyze_best_practices') {
      // Analyze which learning events work best
      const { data: topLearnings, error } = await supabase
        .from('agent_learning_network')
        .select('*')
        .eq('user_id', user.id)
        .gte('success_score', 0.7)
        .order('success_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Group by agent type to find best practices per agent
      const bestPractices: Record<string, any[]> = {};
      for (const learning of topLearnings || []) {
        if (!bestPractices[learning.agent_type]) {
          bestPractices[learning.agent_type] = [];
        }
        bestPractices[learning.agent_type].push(learning);
      }

      logger.info('Best practices analyzed', { agentTypes: Object.keys(bestPractices).length });
      return successResponse({ bestPractices }, requestId);
    }

    throw new Error('Invalid action');

  } catch (error) {
    return handleError({
      functionName: 'cross-agent-learner',
      error,
      requestId
    });
  }
});
