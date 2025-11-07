import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

interface RAGRequest {
  query: string;
  userId: string;
  searchMode?: 'semantic' | 'keyword' | 'hybrid';
  topK?: number;
  rerankResults?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("llamaindex-rag", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    
    const body: RAGRequest = await req.json();
    const { 
      query, 
      userId, 
      searchMode = 'hybrid',
      topK = 10,
      rerankResults = true 
    } = body;

    validateRequiredFields(body, ["query", "userId"]);
    
    logger.info("Processing RAG query", { 
      query: query.substring(0, 100),
      searchMode,
      userId: user?.id || userId
    });

    // STEP 1: Query Transformation
    const transformedQuery = await transformQuery(query, logger);
    logger.debug("Query transformed", { transformedQuery });

    // STEP 2: Hybrid Retrieval
    let results: any[] = [];

    if (searchMode === 'semantic' || searchMode === 'hybrid') {
      const semanticResults = await semanticSearch(supabase, transformedQuery, userId, topK, logger);
      results = [...results, ...semanticResults];
    }

    if (searchMode === 'keyword' || searchMode === 'hybrid') {
      const keywordResults = await keywordSearch(supabase, transformedQuery, userId, topK, logger);
      results = [...results, ...keywordResults];
    }

    // Deduplicate by ID
    const uniqueResults = Array.from(
      new Map(results.map(r => [r.id, r])).values()
    );

    logger.info("Documents retrieved", { count: uniqueResults.length });

    // STEP 3: Re-ranking (if enabled)
    let rankedResults = uniqueResults;
    if (rerankResults && uniqueResults.length > 0) {
      rankedResults = await rerankDocuments(query, uniqueResults, logger);
      logger.debug("Results re-ranked");
    }

    // Take top K after re-ranking
    const finalResults = rankedResults.slice(0, topK);

    // STEP 4: Response Synthesis
    const synthesizedResponse = await synthesizeResponse(query, finalResults, logger);

    // STEP 5: Log query for analytics
    await supabase.from('rag_queries').insert({
      user_id: userId,
      query,
      transformed_query: transformedQuery,
      results_count: finalResults.length
    });

    logger.info("RAG query completed", { resultsCount: finalResults.length });

    return successResponse({
      answer: synthesizedResponse.answer,
      sources: synthesizedResponse.sources,
      retrievedDocs: finalResults.length,
      transformedQuery
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "llamaindex-rag",
      error,
      requestId,
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function transformQuery(query: string, logger: any): Promise<string> {
  const response = await lovableAIFetch("/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "system",
        content: `You are a query transformation expert. Transform user queries into optimized search queries. Return ONLY the transformed query, nothing else.`
      }, {
        role: "user",
        content: query
      }],
      temperature: 0.3
    })
  });

  if (!response.ok) throw response;

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function semanticSearch(
  supabase: any, 
  query: string, 
  userId: string, 
  limit: number,
  logger: any
): Promise<any[]> {
  logger.debug("Performing semantic search");
  
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query
    })
  });

  const embeddingData = await embeddingResponse.json();
  const queryEmbedding = embeddingData.data[0].embedding;

  const { data, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    p_user_id: userId
  });

  if (error) {
    logger.error("Semantic search error", error);
    return [];
  }

  return data.map((d: any) => ({ ...d, search_type: 'semantic' }));
}

async function keywordSearch(
  supabase: any,
  query: string,
  userId: string,
  limit: number,
  logger: any
): Promise<any[]> {
  logger.debug("Performing keyword search");
  
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', userId)
    .textSearch('tsv', query.replace(/\s+/g, ' & '), {
      type: 'websearch',
      config: 'english'
    })
    .limit(limit);

  if (error) {
    logger.error("Keyword search error", error);
    return [];
  }

  return data.map((d: any) => ({ ...d, search_type: 'keyword' }));
}

async function rerankDocuments(query: string, results: any[], logger: any): Promise<any[]> {
  logger.debug("Re-ranking documents", { count: results.length });
  
  const scoringPromises = results.map(async (result) => {
    const response = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "system",
          content: `Score the relevance of this document to the query on a scale of 0-100. Return ONLY a number.

Query: ${query}
Document: ${result.topic || ''} - ${(result.content || '').substring(0, 500)}`
        }],
        temperature: 0.1
      })
    });

    if (!response.ok) return { ...result, relevance_score: 0 };

    const data = await response.json();
    const score = parseInt(data.choices[0].message.content.trim()) || 0;

    return { ...result, relevance_score: score };
  });

  const scoredResults = await Promise.all(scoringPromises);
  return scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);
}

async function synthesizeResponse(
  query: string,
  documents: any[],
  logger: any
): Promise<{ answer: string; sources: any[] }> {
  if (documents.length === 0) {
    return {
      answer: "I couldn't find any relevant information in your knowledge base to answer this question.",
      sources: []
    };
  }

  logger.debug("Synthesizing response", { documentCount: documents.length });

  const context = documents.map((doc, idx) => 
    `[${idx + 1}] ${doc.topic || 'Untitled'}\n${doc.content || ''}\n`
  ).join('\n---\n');

  const response = await lovableAIFetch("/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "system",
        content: `You are a helpful assistant that answers questions based on provided context. ONLY use information from the context below. Cite sources using [1], [2], etc.

Context:
${context}`
      }, {
        role: "user",
        content: query
      }],
      temperature: 0.5
    })
  });

  if (!response.ok) throw response;

  const data = await response.json();
  const answer = data.choices[0].message.content;

  const citationRegex = /\[(\d+)\]/g;
  const citations = [...answer.matchAll(citationRegex)].map(m => parseInt(m[1]) - 1);
  const uniqueCitations = [...new Set(citations)];

  const sources = uniqueCitations
    .filter(idx => idx >= 0 && idx < documents.length)
    .map(idx => ({
      id: documents[idx].id,
      title: documents[idx].topic,
      content: documents[idx].content?.substring(0, 200) + '...',
      source_url: documents[idx].source_url,
      created_at: documents[idx].created_at
    }));

  return { answer, sources };
}