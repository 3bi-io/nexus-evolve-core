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

    const { action, agentType, learningEvent, successScore, context } = await req.json();

    if (action === "record") {
      // Record a learning event
      const { data: learning, error } = await supabase
        .from("agent_learning_network")
        .insert({
          user_id: user.id,
          agent_type: agentType,
          learning_event: learningEvent,
          success_score: successScore,
          context: context || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Share high-value learnings to other agents
      if (successScore > 0.8) {
        const allAgents = ["reasoning", "creative", "learning", "coordinator", "general"];
        const otherAgents = allAgents.filter(a => a !== agentType);
        
        await supabase
          .from("agent_learning_network")
          .update({ shared_to_agents: otherAgents })
          .eq("id", learning.id);

        console.log(`High-value learning shared from ${agentType} to:`, otherAgents);
      }

      return new Response(JSON.stringify({ success: true, learning }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_shared_learnings") {
      // Get learnings shared to this agent
      const { data: learnings, error } = await supabase
        .from("agent_learning_network")
        .select("*")
        .eq("user_id", user.id)
        .contains("shared_to_agents", [agentType])
        .order("success_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      return new Response(JSON.stringify({ learnings }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze_best_practices") {
      // Analyze which learning events work best
      const { data: topLearnings, error } = await supabase
        .from("agent_learning_network")
        .select("*")
        .eq("user_id", user.id)
        .gte("success_score", 0.7)
        .order("success_score", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Group by agent type to find best practices per agent
      const bestPractices: Record<string, any[]> = {};
      for (const learning of topLearnings || []) {
        if (!bestPractices[learning.agent_type]) {
          bestPractices[learning.agent_type] = [];
        }
        bestPractices[learning.agent_type].push(learning);
      }

      return new Response(JSON.stringify({ bestPractices }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error in cross-agent-learner:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});