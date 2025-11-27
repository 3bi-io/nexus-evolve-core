/**
 * Track LLM Observation Function
 * Records LLM usage metrics and costs
 */

import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateNumber } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('track-llm-observation', requestId);

  try {
    logger.info('Processing LLM observation tracking');

    const supabase = initSupabaseClient();

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['agentType', 'modelUsed']);
    validateString(body.agentType, 'agentType');
    validateString(body.modelUsed, 'modelUsed');
    
    const { 
      agentType, 
      modelUsed, 
      promptTokens = 0, 
      completionTokens = 0, 
      latencyMs = 0,
      userId,
      sessionId,
      metadata = {}
    } = body;

    validateNumber(promptTokens, 'promptTokens', { min: 0 });
    validateNumber(completionTokens, 'completionTokens', { min: 0 });
    validateNumber(latencyMs, 'latencyMs', { min: 0 });

    // Calculate cost based on model
    const costPer1kTokens: Record<string, number> = {
      'google/gemini-2.5-flash': 0.00015,
      'google/gemini-2.5-pro': 0.0015,
      'google/gemini-2.5-flash-lite': 0.00005,
      'openai/gpt-5': 0.03,
      'openai/gpt-5-mini': 0.015,
      'openai/gpt-5-nano': 0.001,
      'claude-sonnet-4-5': 0.015,
      'claude-opus-4-1': 0.075
    };
    
    const totalTokens = promptTokens + completionTokens;
    const cost = (totalTokens / 1000) * (costPer1kTokens[modelUsed] || 0.001);
    
    // Only track observations for authenticated users
    if (userId && userId !== 'anonymous') {
      logger.info('Inserting LLM observation', { 
        agentType, 
        modelUsed, 
        totalTokens, 
        cost 
      });

      const { error } = await supabase.from('llm_observations').insert({
        user_id: userId,
        session_id: sessionId,
        agent_type: agentType,
        model_used: modelUsed,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        cost_usd: cost,
        latency_ms: latencyMs,
        metadata
      });

      if (error) {
        logger.error('Failed to track observation', error);
        throw error;
      }
    } else {
      logger.debug('Skipping observation tracking for anonymous user');
    }
    
    logger.info('LLM observation tracked successfully');

    return successResponse({ 
      success: true, 
      cost_usd: cost 
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'track-llm-observation',
      error,
      requestId
    });
  }
});
