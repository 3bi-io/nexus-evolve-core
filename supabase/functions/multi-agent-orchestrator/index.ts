/**
 * Multi-Agent Orchestrator Function
 * Coordinates multiple specialized agents in parallel and synthesizes their responses
 */

import { corsHeaders } from '../_shared/cors.ts';
import { optionalAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateArray } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('multi-agent-orchestrator', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    logger.info('Processing multi-agent orchestration request', {
      userId: user?.id || 'anonymous',
      isAnonymous
    });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['task']);
    validateString(body.task, 'task');

    const { task, sessionId, requestedAgents = ['reasoning', 'creative'] } = body;
    validateArray(requestedAgents, 'requestedAgents');

    const startTime = Date.now();
    logger.info('Starting multi-agent orchestration', { task: task.substring(0, 100), agents: requestedAgents });

    const responses: Record<string, any> = {};

    // Call each agent in parallel
    const agentCalls = requestedAgents.map(async (agentType: string) => {
      try {
        const functionName = `${agentType}-agent`;
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            messages: [{ role: 'user', content: task }],
            context: { collaboration: true, sessionId },
          },
        });

        if (error) {
          logger.error(`Error calling ${functionName}`, error);
          return { agentType, error: error.message };
        }

        return { agentType, response: data };
      } catch (error) {
        logger.error(`Error invoking ${agentType}`, error);
        return { agentType, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(agentCalls);
    
    // Collect responses
    for (const result of results) {
      responses[result.agentType] = result.response || { error: result.error };
    }

    logger.info('Agent responses collected', { agentCount: Object.keys(responses).length });

    // Synthesize responses using Lovable AI
    const synthesisPrompt = `You are synthesizing insights from multiple specialized AI agents.

Task: ${task}

Agent Responses:
${Object.entries(responses).map(([agent, resp]) => 
  `${agent.toUpperCase()}: ${JSON.stringify(resp)}`
).join('\n\n')}

Provide a unified, coherent response that:
1. Combines the best insights from each agent
2. Resolves any contradictions
3. Presents a comprehensive solution
4. Highlights unique perspectives from each agent`;

    const aiResponse = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: synthesisPrompt }],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to synthesize agent responses');
    }

    const aiData = await aiResponse.json();
    const synthesizedResponse = aiData.choices[0].message.content;

    const duration = Date.now() - startTime;

    // Log collaboration only for authenticated users
    if (!isAnonymous) {
      await supabase.from('agent_collaborations').insert({
        user_id: user.id,
        session_id: sessionId,
        agents_involved: requestedAgents,
        task_description: task,
        collaboration_type: 'parallel_synthesis',
        synthesis_result: {
          individual_responses: responses,
          synthesized: synthesizedResponse,
        },
        duration_ms: duration,
      });

      await supabase.from('evolution_logs').insert({
        user_id: user.id,
        log_type: 'multi_agent_collaboration',
        description: `Multi-agent collaboration: ${requestedAgents.join(', ')}`,
        metadata: { agents: requestedAgents, duration, task: task.substring(0, 100) },
      });
    }

    logger.info('Multi-agent collaboration completed', { duration });

    return successResponse({
      synthesized: synthesizedResponse,
      individual_responses: responses,
      agents_involved: requestedAgents,
      duration_ms: duration,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'multi-agent-orchestrator',
      error,
      requestId
    });
  }
});
