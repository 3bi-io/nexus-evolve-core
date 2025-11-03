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

    const { action, agentType, promptVariant, testResult } = await req.json();

    if (action === "create_variant") {
      // Generate new prompt variant using AI
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      // Get current best prompt
      const { data: currentBest } = await supabase
        .from("prompt_experiments")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_type", agentType)
        .eq("status", "winner")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const basePrompt = currentBest?.prompt_variant || `You are a ${agentType} agent.`;

      const optimizationPrompt = `Improve this AI system prompt for a ${agentType} agent:

Current Prompt:
${basePrompt}

Create a variant that:
1. Maintains the core purpose
2. Improves clarity and effectiveness
3. Adds specific instructions for better performance
4. Is concise but comprehensive

Return only the improved prompt, no explanation.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: optimizationPrompt }],
        }),
      });

      const aiData = await aiResponse.json();
      const newPrompt = aiData.choices[0].message.content;

      // Store new variant
      const { data: variant, error } = await supabase
        .from("prompt_experiments")
        .insert({
          user_id: user.id,
          agent_type: agentType,
          prompt_variant: newPrompt,
          parent_prompt_id: currentBest?.id || null,
          status: "testing",
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`Created new prompt variant for ${agentType}`);

      return new Response(JSON.stringify({ variant }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "record_test") {
      // Record test result
      const { satisfaction, latencyMs } = testResult;

      const { data: experiment } = await supabase
        .from("prompt_experiments")
        .select("*")
        .eq("id", promptVariant)
        .single();

      if (!experiment) throw new Error("Experiment not found");

      const newTestCount = experiment.test_count + 1;
      const newSuccessCount = satisfaction >= 0.7 ? experiment.success_count + 1 : experiment.success_count;
      const newAvgSatisfaction = 
        (experiment.avg_satisfaction * experiment.test_count + satisfaction) / newTestCount;
      const newAvgLatency = 
        (experiment.avg_latency_ms * experiment.test_count + latencyMs) / newTestCount;

      await supabase
        .from("prompt_experiments")
        .update({
          test_count: newTestCount,
          success_count: newSuccessCount,
          avg_satisfaction: newAvgSatisfaction,
          avg_latency_ms: newAvgLatency,
        })
        .eq("id", promptVariant);

      // Check if we should promote this variant
      if (newTestCount >= 10) {
        const { data: competitors } = await supabase
          .from("prompt_experiments")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_type", experiment.agent_type)
          .gte("test_count", 10);

        const bestVariant = competitors?.reduce((best, curr) => 
          curr.avg_satisfaction > best.avg_satisfaction ? curr : best
        );

        if (bestVariant?.id === promptVariant) {
          // Promote this variant
          await supabase
            .from("prompt_experiments")
            .update({ status: "retired" })
            .eq("agent_type", experiment.agent_type)
            .eq("status", "winner");

          await supabase
            .from("prompt_experiments")
            .update({ status: "winner", promoted_at: new Date().toISOString() })
            .eq("id", promptVariant);

          console.log(`Promoted prompt variant for ${experiment.agent_type}`);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_current") {
      // Get current best prompt
      const { data: winner } = await supabase
        .from("prompt_experiments")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_type", agentType)
        .eq("status", "winner")
        .order("promoted_at", { ascending: false })
        .limit(1)
        .single();

      return new Response(JSON.stringify({ prompt: winner }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error in prompt-optimizer:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});