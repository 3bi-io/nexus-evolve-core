import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { tavilyFetch } from "../_shared/api-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("tavily-search", requestId);
  
  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    
    const body = await req.json();
    const { query, searchDepth = "basic", maxResults = 5 } = body;
    
    validateRequiredFields({ query }, ["query"]);
    
    logger.info("Processing Tavily search", { 
      query: query.substring(0, 100),
      searchDepth,
      userId: user?.id
    });
    
    const response = await tavilyFetch("/search", {
      method: "POST",
      body: JSON.stringify({
        query,
        search_depth: searchDepth,
        include_answer: true,
        include_raw_content: false,
        max_results: maxResults,
        include_images: false,
        include_domains: [],
        exclude_domains: []
      }),
    }, {
      timeout: 30000,
      maxRetries: 2
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    
    logger.info("Search completed", { resultsCount: data.results?.length || 0 });
    
    return successResponse({
      answer: data.answer,
      results: data.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      })) || [],
      query: data.query,
      follow_up_questions: data.follow_up_questions || []
    }, requestId);
  } catch (error) {
    return handleError({
      functionName: "tavily-search",
      error,
      requestId,
    });
  }
});