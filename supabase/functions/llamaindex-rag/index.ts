import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  try {
    const { 
      query, 
      userId, 
      searchMode = 'hybrid',
      topK = 10,
      rerankResults = true 
    }: RAGRequest = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`[RAG] Processing query: "${query}" in ${searchMode} mode`);

    // STEP 1: Query Transformation
    const transformedQuery = await transformQuery(query);
    console.log(`[RAG] Transformed query: "${transformedQuery}"`);

    // STEP 2: Hybrid Retrieval
    let results: any[] = [];

    if (searchMode === 'semantic' || searchMode === 'hybrid') {
      const semanticResults = await semanticSearch(supabase, transformedQuery, userId, topK);
      results = [...results, ...semanticResults];
    }

    if (searchMode === 'keyword' || searchMode === 'hybrid') {
      const keywordResults = await keywordSearch(supabase, transformedQuery, userId, topK);
      results = [...results, ...keywordResults];
    }

    // Deduplicate by ID
    const uniqueResults = Array.from(
      new Map(results.map(r => [r.id, r])).values()
    );

    console.log(`[RAG] Retrieved ${uniqueResults.length} unique documents`);

    // STEP 3: Re-ranking (if enabled)
    let rankedResults = uniqueResults;
    if (rerankResults && uniqueResults.length > 0) {
      rankedResults = await rerankDocuments(query, uniqueResults);
      console.log(`[RAG] Re-ranked results`);
    }

    // Take top K after re-ranking
    const finalResults = rankedResults.slice(0, topK);

    // STEP 4: Response Synthesis
    const synthesizedResponse = await synthesizeResponse(query, finalResults);

    // STEP 5: Log query for analytics
    await supabase.from('rag_queries').insert({
      user_id: userId,
      query,
      transformed_query: transformedQuery,
      results_count: finalResults.length
    });

    return new Response(
      JSON.stringify({
        answer: synthesizedResponse.answer,
        sources: synthesizedResponse.sources,
        retrievedDocs: finalResults.length,
        transformedQuery
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[RAG] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ===== HELPER FUNCTIONS =====

async function transformQuery(query: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "system",
        content: `You are a query transformation expert. Transform user queries into optimized search queries.
        
Rules:
- Expand abbreviations
- Add relevant synonyms
- Remove filler words
- Make queries more specific
- Keep it concise (max 20 words)

Example:
Input: "How do I fix my code?"
Output: "debugging code errors troubleshooting programming fixes solutions"

Return ONLY the transformed query, nothing else.`
      }, {
        role: "user",
        content: query
      }],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function semanticSearch(
  supabase: any, 
  query: string, 
  userId: string, 
  limit: number
): Promise<any[]> {
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
    console.error("Semantic search error:", error);
    return [];
  }

  return data.map((d: any) => ({
    ...d,
    search_type: 'semantic'
  }));
}

async function keywordSearch(
  supabase: any,
  query: string,
  userId: string,
  limit: number
): Promise<any[]> {
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
    console.error("Keyword search error:", error);
    return [];
  }

  return data.map((d: any) => ({
    ...d,
    search_type: 'keyword'
  }));
}

async function rerankDocuments(query: string, results: any[]): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const scoringPromises = results.map(async (result) => {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "system",
          content: `Score the relevance of this document to the query on a scale of 0-100.
Return ONLY a number, nothing else.

Query: ${query}
Document: ${result.topic || ''} - ${(result.content || '').substring(0, 500)}`
        }],
        temperature: 0.1
      })
    });

    const data = await response.json();
    const score = parseInt(data.choices[0].message.content.trim()) || 0;

    return {
      ...result,
      relevance_score: score
    };
  });

  const scoredResults = await Promise.all(scoringPromises);
  return scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);
}

async function synthesizeResponse(
  query: string,
  documents: any[]
): Promise<{ answer: string; sources: any[] }> {
  if (documents.length === 0) {
    return {
      answer: "I couldn't find any relevant information in your knowledge base to answer this question.",
      sources: []
    };
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const context = documents.map((doc, idx) => 
    `[${idx + 1}] ${doc.topic || 'Untitled'}\n${doc.content || ''}\n`
  ).join('\n---\n');

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "system",
        content: `You are a helpful assistant that answers questions based on provided context.

CRITICAL RULES:
1. ONLY use information from the context below
2. Cite sources using [1], [2], etc. format
3. If the context doesn't contain the answer, say so clearly
4. Be concise but complete

Context:
${context}`
      }, {
        role: "user",
        content: query
      }],
      temperature: 0.5
    })
  });

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
