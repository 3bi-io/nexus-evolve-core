import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { openAIFetch } from "../_shared/api-client.ts";

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

    const embeddingResponse = await openAIFetch("/v1/embeddings", {
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text
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
    const embedding = embeddingData.data[0].embedding;

    // Store embedding in database
    if (table === "agent_memory") {
      await supabase
        .from("agent_memory")
        .update({ embedding })
        .eq("id", record_id)
        .eq("user_id", user.id);
    } else if (table === "knowledge_base") {
      await supabase
        .from("knowledge_base")
        .update({ embedding })
        .eq("id", record_id)
        .eq("user_id", user.id);
    } else {
      throw new Error(`Unsupported table: ${table}`);
    }

    console.log(`Real embedding stored for ${table} ${record_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Embedding generated and stored using OpenAI",
        dimensions: 1536,
        model: "text-embedding-3-small"
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
