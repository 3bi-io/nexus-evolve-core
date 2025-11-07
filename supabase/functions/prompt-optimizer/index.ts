/**
 * Prompt Optimizer Function
 * Creates and tests prompt variants to optimize agent performance
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateEnum } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('prompt-optimizer', requestId);

  try {
    logger.info('Processing prompt optimization request');

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
    validateEnum(body.action, 'action', ['create_variant', 'record_test', 'get_current']);

    const { action, agentType, promptVariant, testResult } = body;

    if (action === 'create_variant') {
      validateRequiredFields(body, ['agentType']);
      validateString(agentType, 'agentType');

      // Get current best prompt
      const { data: currentBest } = await supabase
        .from('prompt_experiments')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_type', agentType)
        .eq('status', 'winner')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const basePrompt = currentBest?.prompt_variant || `You are a ${agentType} agent.`;

      const optimizationPrompt = `Improve this AI system prompt for a ${agentType} agent:

Current Prompt:
${basePrompt}

Create a variant that:
1. Maintains the core purpose
2. Improves clarity and effectiveness
3. Adds specific instructions for better performance
4. Is concise but comprehensive

Return only the improved prompt, no explanation.`;

      logger.info('Generating prompt variant', { agentType });

      const aiResponse = await lovableAIFetch('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: optimizationPrompt }],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate prompt variant');
      }

      const aiData = await aiResponse.json();
      const newPrompt = aiData.choices[0].message.content;

      // Store new variant
      const { data: variant, error } = await supabase
        .from('prompt_experiments')
        .insert({
          user_id: user.id,
          agent_type: agentType,
          prompt_variant: newPrompt,
          parent_prompt_id: currentBest?.id || null,
          status: 'testing',
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Prompt variant created', { agentType, variantId: variant.id });
      return successResponse({ variant }, requestId);
    }

    if (action === 'record_test') {
      validateRequiredFields(body, ['promptVariant', 'testResult']);

      const { satisfaction, latencyMs } = testResult;

      const { data: experiment } = await supabase
        .from('prompt_experiments')
        .select('*')
        .eq('id', promptVariant)
        .single();

      if (!experiment) throw new Error('Experiment not found');

      const newTestCount = experiment.test_count + 1;
      const newSuccessCount = satisfaction >= 0.7 ? experiment.success_count + 1 : experiment.success_count;
      const newAvgSatisfaction = 
        (experiment.avg_satisfaction * experiment.test_count + satisfaction) / newTestCount;
      const newAvgLatency = 
        (experiment.avg_latency_ms * experiment.test_count + latencyMs) / newTestCount;

      await supabase
        .from('prompt_experiments')
        .update({
          test_count: newTestCount,
          success_count: newSuccessCount,
          avg_satisfaction: newAvgSatisfaction,
          avg_latency_ms: newAvgLatency,
        })
        .eq('id', promptVariant);

      // Check if we should promote this variant
      if (newTestCount >= 10) {
        const { data: competitors } = await supabase
          .from('prompt_experiments')
          .select('*')
          .eq('user_id', user.id)
          .eq('agent_type', experiment.agent_type)
          .gte('test_count', 10);

        const bestVariant = competitors?.reduce((best, curr) => 
          curr.avg_satisfaction > best.avg_satisfaction ? curr : best
        );

        if (bestVariant?.id === promptVariant) {
          // Promote this variant
          await supabase
            .from('prompt_experiments')
            .update({ status: 'retired' })
            .eq('agent_type', experiment.agent_type)
            .eq('status', 'winner');

          await supabase
            .from('prompt_experiments')
            .update({ status: 'winner', promoted_at: new Date().toISOString() })
            .eq('id', promptVariant);

          logger.info('Prompt variant promoted', { agentType: experiment.agent_type });
        }
      }

      return successResponse({ success: true }, requestId);
    }

    if (action === 'get_current') {
      validateRequiredFields(body, ['agentType']);
      validateString(agentType, 'agentType');

      // Get current best prompt
      const { data: winner } = await supabase
        .from('prompt_experiments')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_type', agentType)
        .eq('status', 'winner')
        .order('promoted_at', { ascending: false })
        .limit(1)
        .single();

      logger.info('Current best prompt retrieved', { agentType });
      return successResponse({ prompt: winner }, requestId);
    }

    throw new Error('Invalid action');

  } catch (error) {
    return handleError({
      functionName: 'prompt-optimizer',
      error,
      requestId
    });
  }
});
