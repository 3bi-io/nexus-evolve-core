import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query, searchDepth = "basic", maxResults = 5 } = await req.json();
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY not configured");
    }
    
    console.log(`[Tavily] Searching for: "${query}" (depth: ${searchDepth})`);
    
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: searchDepth, // "basic" or "advanced"
        include_answer: true,
        include_raw_content: false,
        max_results: maxResults,
        include_images: false,
        include_domains: [],
        exclude_domains: []
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tavily] API error: ${response.status} - ${errorText}`);
      throw new Error(`Tavily API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`[Tavily] Found ${data.results?.length || 0} results`);
    
    // Return in a format compatible with the agent system
    return new Response(JSON.stringify({
      answer: data.answer,
      results: data.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      })) || [],
      query: data.query,
      follow_up_questions: data.follow_up_questions || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Tavily] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
