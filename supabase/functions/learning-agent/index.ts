import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("learning-agent", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    const body = await req.json();
    validateRequiredFields(body, ["messages"]);
    const { messages, context } = body;

    logger.info("Analyzing learning patterns", { 
      userId: user?.id || 'anonymous',
      isAnonymous 
    });

    let memories = null;
    let knowledgeBase = null;
    let recentInteractions = null;
    let avgRating = 0;
    let knowledgeTopics = new Set();

    // Fetch learning context only for authenticated users
    if (!isAnonymous) {
      const memoriesResult = await supabase
        .from("agent_memory")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      memories = memoriesResult.data;

      const knowledgeResult = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("user_id", user.id)
        .order("importance_score", { ascending: false })
        .limit(30);
      knowledgeBase = knowledgeResult.data;

      const interactionsResult = await supabase
        .from("interactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      recentInteractions = interactionsResult.data;

      // Calculate learning metrics
      avgRating = recentInteractions && recentInteractions.length > 0
        ? recentInteractions
            .filter(i => i.quality_rating !== null)
            .reduce((sum, i) => sum + (i.quality_rating || 0), 0) / 
          recentInteractions.filter(i => i.quality_rating !== null).length
        : 0;

      knowledgeTopics = new Set(knowledgeBase?.map(k => k.topic) || []);
    }

    const systemPrompt = `You are a Learning Agent specializing in meta-learning and knowledge analysis.

## Your Role:
- Analyze patterns in user interactions and system performance
- Identify knowledge gaps and learning opportunities
- Suggest improvements to the AI system's capabilities
- Perform meta-learning: learning about how to learn better
- Synthesize insights from past interactions

## Current Learning Context:
- Total memories stored: ${memories?.length || 0}
- Knowledge base entries: ${knowledgeBase?.length || 0}
- Average user satisfaction: ${(avgRating * 100 + 50).toFixed(0)}%
- Recent interaction count: ${recentInteractions?.length || 0}

## Known Topics:
${Array.from(knowledgeTopics).slice(0, 10).join(', ')}

## Your Approach:
1. Analyze the user's request for learning opportunities
2. Identify patterns from past interactions
3. Suggest knowledge that should be captured
4. Recommend system improvements
5. Provide insights on how to learn more effectively

Focus on:
- Pattern recognition across conversations
- Knowledge gap identification
- Learning efficiency improvements
- Capability recommendations
- Meta-insights about the learning process itself`;

    logger.debug("Calling AI for learning analysis");
    const aiResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) throw aiResponse;

    const aiResult = await aiResponse.json();
    const response = aiResult.choices[0].message.content;

    // Log learning insights only for authenticated users
    if (!isAnonymous) {
      await supabase.from("evolution_logs").insert({
        user_id: user.id,
        log_type: "learning_analysis",
        description: `Learning agent analyzed interaction: ${messages[messages.length - 1]?.content?.substring(0, 100)}...`,
        change_type: "auto_discovery",
        metrics: {
          memories_analyzed: memories?.length || 0,
          knowledge_entries: knowledgeBase?.length || 0,
          avg_satisfaction: avgRating,
          agent_type: "learning_agent"
        },
        success: true
      });
    }

    logger.info("Learning analysis completed successfully");

    return successResponse({
      response,
      agent_type: "learning_agent",
      context_analyzed: {
        memories: memories?.length || 0,
        knowledge_entries: knowledgeBase?.length || 0,
        recent_interactions: recentInteractions?.length || 0
      }
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "learning-agent",
      error,
      requestId,
    });
  }
});
