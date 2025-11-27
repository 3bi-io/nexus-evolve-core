import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

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

  const requestId = crypto.randomUUID();
  const logger = createLogger("coordinator-agent", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    const body = await req.json();
    validateRequiredFields(body, ["message"]);
    const { message, sessionId } = body;

    logger.info("Analyzing intent", { 
      userId: user?.id || 'anonymous',
      isAnonymous,
      messagePreview: message.substring(0, 50) 
    });

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

    const analysisResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an intent analysis specialist. Return only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!analysisResponse.ok) throw analysisResponse;

    const analysisResult = await analysisResponse.json();
    const analysisText = analysisResult.choices[0].message.content;

    // Extract JSON from response
    let analysis: AgentAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = {
          intent: "general_query",
          complexity: "low",
          recommended_agents: ["general"],
          requires_coordination: false,
          reasoning: "Failed to parse intent, using general agent"
        };
      }
    } catch (e) {
      logger.error("Failed to parse analysis", e);
      analysis = {
        intent: "general_query",
        complexity: "low",
        recommended_agents: ["general"],
        requires_coordination: false,
        reasoning: "Error parsing intent analysis"
      };
    }

    logger.info("Intent analysis complete", { analysis });

    // Log coordination decision only for authenticated users
    if (!isAnonymous) {
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
    }

    return successResponse({
      analysis,
      message: `Routing to ${analysis.recommended_agents.join(" + ")}`,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "coordinator-agent",
      error,
      requestId,
    });
  }
});
