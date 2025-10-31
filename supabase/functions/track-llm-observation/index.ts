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
    const { 
      agentType, 
      modelUsed, 
      promptTokens, 
      completionTokens, 
      latencyMs,
      userId,
      sessionId,
      metadata = {}
    } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Calculate cost based on model
    const costPer1kTokens: Record<string, number> = {
      "google/gemini-2.5-flash": 0.00015,
      "google/gemini-2.5-pro": 0.0015,
      "google/gemini-2.5-flash-lite": 0.00005,
      "openai/gpt-5": 0.03,
      "openai/gpt-5-mini": 0.015,
      "openai/gpt-5-nano": 0.001,
      "claude-sonnet-4-5": 0.015,
      "claude-opus-4-1": 0.075
    };
    
    const totalTokens = (promptTokens || 0) + (completionTokens || 0);
    const cost = (totalTokens / 1000) * (costPer1kTokens[modelUsed] || 0.001);
    
    const { error } = await supabase.from('llm_observations').insert({
      user_id: userId,
      session_id: sessionId,
      agent_type: agentType,
      model_used: modelUsed,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_usd: cost,
      latency_ms: latencyMs,
      metadata
    });

    if (error) {
      console.error("Failed to track observation:", error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, cost_usd: cost }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Track LLM observation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
