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

    const { messages, context } = await req.json();

    console.log(`Learning agent analyzing request for user ${user.id}`);

    // Fetch learning context: past patterns, knowledge gaps, improvements
    const { data: memories } = await supabase
      .from("agent_memory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("user_id", user.id)
      .order("importance_score", { ascending: false })
      .limit(30);

    const { data: recentInteractions } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Calculate learning metrics
    const avgRating = recentInteractions && recentInteractions.length > 0
      ? recentInteractions
          .filter(i => i.quality_rating !== null)
          .reduce((sum, i) => sum + (i.quality_rating || 0), 0) / 
        recentInteractions.filter(i => i.quality_rating !== null).length
      : 0;

    // Identify knowledge gaps and patterns
    const knowledgeTopics = new Set(knowledgeBase?.map(k => k.topic) || []);
    const recentTopics = recentInteractions?.map(i => i.message.substring(0, 100)) || [];

    // Build learning-focused system prompt
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const response = aiResult.choices[0].message.content;

    // Log learning insights
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

    console.log("Learning agent response generated successfully");

    return new Response(
      JSON.stringify({
        response,
        agent_type: "learning_agent",
        context_analyzed: {
          memories: memories?.length || 0,
          knowledge_entries: knowledgeBase?.length || 0,
          recent_interactions: recentInteractions?.length || 0
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Learning agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
