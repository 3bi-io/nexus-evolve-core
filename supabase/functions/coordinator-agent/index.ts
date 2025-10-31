import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentAnalysis {
  intent: string;
  complexity: "low" | "medium" | "high";
  recommended_agents: string[];
  requires_coordination: boolean;
  requires_web_search?: boolean;
  reasoning: string;
}

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

    const { message, sessionId } = await req.json();

    console.log(`Coordinator analyzing intent: "${message}"`);

    // Analyze user intent to determine which agent(s) to use
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const analysisPrompt = `Analyze this user message and determine which specialized AI agent(s) should handle it.

User message: "${message}"

Available agents:
1. **reasoning-agent**: Deep multi-step reasoning, mathematical/logical problems, chain-of-thought analysis
2. **creative-agent**: Ideation, brainstorming, creative problem-solving, out-of-the-box thinking
3. **learning-agent**: Meta-learning, pattern analysis, knowledge gap identification, system improvements
4. **general-agent**: Standard conversational responses, general questions, simple tasks

Return a JSON object with:
{
  "intent": "Brief description of user's intent",
  "complexity": "low" | "medium" | "high",
  "recommended_agents": ["agent1", "agent2"],
  "requires_coordination": true/false,
  "requires_web_search": true/false,
  "reasoning": "Why these agents were chosen"
}

Guidelines:
- Use reasoning-agent for complex logical problems, math, step-by-step analysis
- Use creative-agent for brainstorming, ideas, innovative solutions
- Use learning-agent for questions about learning patterns, improvements, meta-analysis
- Use general-agent for simple questions, greetings, basic tasks
- Set complexity "high" for multi-step reasoning, complex analysis, or nuanced problems
- Set requires_web_search = true if query needs real-time info (news, weather, current events, stock prices)
- Use multiple agents only if task genuinely requires multiple perspectives
- requires_coordination = true if multiple agents needed, false otherwise`;

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an intent analysis specialist. Return only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`Analysis failed: ${analysisResponse.status}`);
    }

    const analysisResult = await analysisResponse.json();
    const analysisText = analysisResult.choices[0].message.content;

    // Extract JSON from response
    let analysis: AgentAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to general agent if parsing fails
        analysis = {
          intent: "general_query",
          complexity: "low",
          recommended_agents: ["general"],
          requires_coordination: false,
          reasoning: "Failed to parse intent, using general agent"
        };
      }
    } catch (e) {
      console.error("Failed to parse analysis:", e);
      analysis = {
        intent: "general_query",
        complexity: "low",
        recommended_agents: ["general"],
        requires_coordination: false,
        reasoning: "Error parsing intent analysis"
      };
    }

    console.log("Intent analysis:", analysis);

    // Log coordination decision
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "agent_coordination",
      description: `Coordinator routed request to: ${analysis.recommended_agents.join(", ")}`,
      change_type: "auto_discovery",
      metrics: {
        intent: analysis.intent,
        complexity: analysis.complexity,
        agents: analysis.recommended_agents,
        requires_coordination: analysis.requires_coordination,
        message_length: message.length
      },
      success: true
    });

    return new Response(
      JSON.stringify({
        analysis,
        message: `Routing to ${analysis.recommended_agents.join(" + ")}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Coordinator error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        fallback_agent: "general"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
