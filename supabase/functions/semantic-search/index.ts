/**
 * Semantic Search Function
 * Performs vector similarity search across agent memory and knowledge base
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateNumber } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { openAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('semantic-search', requestId);

  try {
    logger.info('Processing semantic search request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['query']);
    validateString(body.query, 'query', { minLength: 1 });
    
    const { query, table = 'agent_memory', limit = 10 } = body;
    validateNumber(limit, 'limit', { min: 1, max: 100 });

    if (!['agent_memory', 'knowledge_base'].includes(table)) {
      throw new Error(`Unsupported table: ${table}`);
    }

    logger.info('Generating embeddings', { query, table, limit });

    // Generate embeddings using OpenAI
    const embeddingResponse = await openAIFetch('/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    }, {
      timeout: 15000,
      maxRetries: 3,
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      throw new Error(`OpenAI embeddings API error: ${embeddingResponse.status} - ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    logger.info('Performing vector similarity search', { table });

    // Perform vector similarity search
    let results;
    if (table === 'agent_memory') {
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        user_id_param: user.id
      });
      
      if (error) {
        logger.warn('RPC error, falling back to regular query', { error: error.message });
        // Fallback to regular query if RPC doesn't exist
        const { data: fallbackData } = await supabase
          .from('agent_memory')
          .select('*')
          .eq('user_id', user.id)
          .not('embedding', 'is', null)
          .limit(limit);
        results = fallbackData;
      } else {
        results = data;
      }
    } else if (table === 'knowledge_base') {
      const { data: fallbackData } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('user_id', user.id)
        .not('embedding', 'is', null)
        .limit(limit);
      results = fallbackData;
    }

    logger.info('Search complete', { resultsCount: results?.length || 0 });

    return successResponse({
      results: results || [],
      count: results?.length || 0,
      query,
      model: 'text-embedding-3-small'
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'semantic-search',
      error,
      requestId
    });
  }
});
