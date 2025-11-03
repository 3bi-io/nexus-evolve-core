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

    const { task, sessionId, requestedAgents } = await req.json();
    const startTime = Date.now();

    console.log(`Multi-agent orchestration requested for task: ${task}`);

    // Determine which agents to involve
    const agents = requestedAgents || ["reasoning", "creative"];
    const responses: Record<string, any> = {};

    // Call each agent in parallel
    const agentCalls = agents.map(async (agentType: string) => {
      try {
        const functionName = `${agentType}-agent`;
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            messages: [{ role: "user", content: task }],
            context: { collaboration: true, sessionId },
          },
        });

        if (error) {
          console.error(`Error calling ${functionName}:`, error);
          return { agentType, error: error.message };
        }

        return { agentType, response: data };
      } catch (error) {
        console.error(`Error invoking ${agentType}:`, error);
        return { agentType, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    const results = await Promise.all(agentCalls);
    
    // Collect responses
    for (const result of results) {
      responses[result.agentType] = result.response || { error: result.error };
    }

    // Synthesize responses using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const synthesisPrompt = `You are synthesizing insights from multiple specialized AI agents.

Task: ${task}

Agent Responses:
${Object.entries(responses).map(([agent, resp]) => 
  `${agent.toUpperCase()}: ${JSON.stringify(resp)}`
).join("\n\n")}

Provide a unified, coherent response that:
1. Combines the best insights from each agent
2. Resolves any contradictions
3. Presents a comprehensive solution
4. Highlights unique perspectives from each agent`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: synthesisPrompt }],
      }),
    });

    const aiData = await aiResponse.json();
    const synthesizedResponse = aiData.choices[0].message.content;

    const duration = Date.now() - startTime;

    // Log collaboration
    await supabase.from("agent_collaborations").insert({
      user_id: user.id,
      session_id: sessionId,
      agents_involved: agents,
      task_description: task,
      collaboration_type: "parallel_synthesis",
      synthesis_result: {
        individual_responses: responses,
        synthesized: synthesizedResponse,
      },
      duration_ms: duration,
    });

    // Log to evolution
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "multi_agent_collaboration",
      description: `Multi-agent collaboration: ${agents.join(", ")}`,
      metadata: { agents, duration, task: task.substring(0, 100) },
    });

    console.log(`Multi-agent collaboration completed in ${duration}ms`);

    return new Response(JSON.stringify({
      synthesized: synthesizedResponse,
      individual_responses: responses,
      agents_involved: agents,
      duration_ms: duration,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in multi-agent-orchestrator:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});