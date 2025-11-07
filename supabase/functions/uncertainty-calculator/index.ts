/**
 * Uncertainty Calculator Function
 * Calculates confidence scores and determines when to request clarification
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
  const logger = createLogger('uncertainty-calculator', requestId);

  try {
    logger.info('Processing uncertainty calculation request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['query', 'agentType']);
    validateString(body.query, 'query');
    validateString(body.agentType, 'agentType');

    const { query, agentType, sessionId, context } = body;

    logger.info('Calculating confidence', { agentType, queryLength: query.length });

    // Check knowledge base for similar queries
    const { data: knowledgeMatches } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', user.id)
      .textSearch('tsv', query, { type: 'websearch' })
      .limit(5);

    // Check past interactions
    const { data: pastInteractions } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .ilike('user_query', `%${query.substring(0, 50)}%`)
      .limit(5);

    // Calculate confidence factors
    const factors = {
      knowledge_coverage: (knowledgeMatches?.length || 0) / 5,
      past_experience: (pastInteractions?.length || 0) / 5,
      query_complexity: query.split(' ').length > 20 ? 0.5 : 0.8,
      context_availability: context ? 0.9 : 0.6,
    };

    const confidenceScore = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

    // Determine uncertainty reasons
    const uncertaintyReasons: string[] = [];
    if (factors.knowledge_coverage < 0.5) {
      uncertaintyReasons.push('Limited relevant knowledge in database');
    }
    if (factors.past_experience < 0.5) {
      uncertaintyReasons.push('No similar past interactions');
    }
    if (factors.query_complexity < 0.7) {
      uncertaintyReasons.push('Complex or multi-part query');
    }
    if (factors.context_availability < 0.7) {
      uncertaintyReasons.push('Insufficient context provided');
    }

    const shouldRequestClarification = confidenceScore < 0.6 && uncertaintyReasons.length >= 2;

    // Store uncertainty score
    const { data: score, error } = await supabase
      .from('uncertainty_scores')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        agent_type: agentType,
        query: query,
        confidence_score: confidenceScore,
        uncertainty_reasons: uncertaintyReasons,
        clarification_requested: shouldRequestClarification,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Confidence calculated', { 
      confidence: (confidenceScore * 100).toFixed(1) + '%', 
      shouldClarify: shouldRequestClarification 
    });

    return successResponse({
      confidence: confidenceScore,
      uncertainty_reasons: uncertaintyReasons,
      should_clarify: shouldRequestClarification,
      factors: factors,
      score_id: score.id,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'uncertainty-calculator',
      error,
      requestId
    });
  }
});
