import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");

    const { query, table = "agent_memory", limit = 10 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query text required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Semantic search in ${table}: "${query}"`);

    // Generate embedding for query text
    // Note: Using mock embedding for now (same as generate-embeddings)
    const queryEmbedding = generateMockEmbedding(query);

    // Perform vector similarity search
    let results;
    if (table === "agent_memory") {
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        user_id_param: user.id
      });
      
      if (error) {
        console.error("RPC error:", error);
        // Fallback to regular query if RPC doesn't exist
        const { data: fallbackData } = await supabase
          .from("agent_memory")
          .select("*")
          .eq("user_id", user.id)
          .not("embedding", "is", null)
          .limit(limit);
        results = fallbackData;
      } else {
        results = data;
      }
    } else if (table === "knowledge_base") {
      const { data: fallbackData } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("user_id", user.id)
        .not("embedding", "is", null)
        .limit(limit);
      results = fallbackData;
    } else {
      throw new Error(`Unsupported table: ${table}`);
    }

    console.log(`Found ${results?.length || 0} semantic matches`);

    return new Response(
      JSON.stringify({
        results: results || [],
        count: results?.length || 0,
        query,
        note: "Using mock embeddings - integrate real embeddings API for production semantic search"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Semantic search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Same mock embedding function as generate-embeddings
function generateMockEmbedding(text: string): number[] {
  const embedding = new Array(1536);
  let hash = 0;
  
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  
  let seed = Math.abs(hash);
  for (let i = 0; i < 1536; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    embedding[i] = (seed / 233280) * 2 - 1;
  }
  
  return embedding;
}
