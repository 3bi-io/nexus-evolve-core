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

    const { text, table, record_id } = await req.json();

    if (!text || !table || !record_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, table, record_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating embedding for ${table} record ${record_id}`);

    // Generate embedding using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Note: Lovable AI doesn't currently have a dedicated embeddings endpoint
    // This is a placeholder implementation that would use a real embeddings API
    // For production, you'd want to use OpenAI's embeddings API or similar
    
    // Placeholder: Generate a mock embedding vector (1536 dimensions for OpenAI compatibility)
    // In production, replace with actual API call:
    // const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${OPENAI_API_KEY}`,
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     model: "text-embedding-3-small",
    //     input: text
    //   })
    // });

    // For now, create a deterministic "embedding" based on text hash
    // This allows the system to work but won't provide semantic search benefits
    const mockEmbedding = generateMockEmbedding(text);

    // Store embedding in database
    if (table === "agent_memory") {
      await supabase
        .from("agent_memory")
        .update({ embedding: mockEmbedding })
        .eq("id", record_id)
        .eq("user_id", user.id);
    } else if (table === "knowledge_base") {
      await supabase
        .from("knowledge_base")
        .update({ embedding: mockEmbedding })
        .eq("id", record_id)
        .eq("user_id", user.id);
    } else {
      throw new Error(`Unsupported table: ${table}`);
    }

    console.log(`Embedding stored for ${table} ${record_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Embedding generated and stored (mock implementation)",
        dimensions: 1536,
        note: "To enable true semantic search, integrate OpenAI embeddings API or similar"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate embeddings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generate a deterministic mock embedding (1536 dimensions)
// In production, replace with actual embeddings API
function generateMockEmbedding(text: string): number[] {
  const embedding = new Array(1536);
  let hash = 0;
  
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Use hash to seed deterministic "random" values
  let seed = Math.abs(hash);
  for (let i = 0; i < 1536; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    embedding[i] = (seed / 233280) * 2 - 1; // Values between -1 and 1
  }
  
  return embedding;
}
