import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { query, agentType, sessionId, context } = await req.json();

    // Check knowledge base for similar queries
    const { data: knowledgeMatches } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("user_id", user.id)
      .textSearch("tsv", query, { type: "websearch" })
      .limit(5);

    // Check past interactions
    const { data: pastInteractions } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .ilike("user_query", `%${query.substring(0, 50)}%`)
      .limit(5);

    // Calculate confidence factors
    const factors = {
      knowledge_coverage: (knowledgeMatches?.length || 0) / 5,
      past_experience: (pastInteractions?.length || 0) / 5,
      query_complexity: query.split(" ").length > 20 ? 0.5 : 0.8,
      context_availability: context ? 0.9 : 0.6,
    };

    const confidenceScore = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

    // Determine uncertainty reasons
    const uncertaintyReasons: string[] = [];
    if (factors.knowledge_coverage < 0.5) {
      uncertaintyReasons.push("Limited relevant knowledge in database");
    }
    if (factors.past_experience < 0.5) {
      uncertaintyReasons.push("No similar past interactions");
    }
    if (factors.query_complexity < 0.7) {
      uncertaintyReasons.push("Complex or multi-part query");
    }
    if (factors.context_availability < 0.7) {
      uncertaintyReasons.push("Insufficient context provided");
    }

    const shouldRequestClarification = confidenceScore < 0.6 && uncertaintyReasons.length >= 2;

    // Store uncertainty score
    const { data: score, error } = await supabase
      .from("uncertainty_scores")
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

    console.log(`Confidence: ${(confidenceScore * 100).toFixed(1)}% for "${query.substring(0, 50)}..."`);

    return new Response(JSON.stringify({
      confidence: confidenceScore,
      uncertainty_reasons: uncertaintyReasons,
      should_clarify: shouldRequestClarification,
      factors: factors,
      score_id: score.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in uncertainty-calculator:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});