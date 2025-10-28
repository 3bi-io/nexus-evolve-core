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

    console.log(`Discovering capabilities for user ${user.id}`);

    // Analyze user interaction patterns
    const { data: interactions } = await supabase
      .from("interactions")
      .select("message, quality_rating, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!interactions || interactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Not enough interaction data to discover capabilities",
          suggestions: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze current capabilities
    const { data: existingCapabilities } = await supabase
      .from("capability_modules")
      .select("capability_name, description, usage_count")
      .eq("user_id", user.id);

    // Calculate interaction statistics
    const ratedInteractions = interactions.filter(i => i.quality_rating !== null);
    const avgRating = ratedInteractions.length > 0
      ? ratedInteractions.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / ratedInteractions.length
      : 0;

    // Identify low-rated topics
    const lowRatedTopics = interactions
      .filter(i => (i.quality_rating || 0) < 0)
      .map(i => i.message);

    // Identify common patterns in messages
    const messageTopics = interactions.map(i => i.message.substring(0, 200));

    // AI-powered capability gap analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const analysisPrompt = `Analyze these user interactions and identify capability gaps.

USER INTERACTION PATTERNS (last ${interactions.length} messages):
${messageTopics.slice(0, 20).join('\n---\n')}

CURRENT CAPABILITIES:
${existingCapabilities?.map(c => `- ${c.capability_name}: ${c.description} (used ${c.usage_count} times)`).join('\n') || 'None'}

LOW-RATED INTERACTIONS (user struggled with these):
${lowRatedTopics.slice(0, 10).join('\n---\n')}

PERFORMANCE METRICS:
- Total interactions: ${interactions.length}
- Average rating: ${(avgRating * 100 + 50).toFixed(0)}%
- Low-rated interactions: ${lowRatedTopics.length}

Identify 3-5 new capabilities that would improve this AI system based on:
1. Repeated topics/patterns in user messages
2. Areas with low satisfaction ratings
3. Emerging user needs not covered by existing capabilities
4. Knowledge gaps that cause poor responses

Return ONLY valid JSON array:
[
  {
    "capability_name": "Short descriptive name",
    "description": "What this capability does",
    "reasoning": "Why this is needed based on the data",
    "confidence_score": 0.0-1.0,
    "evidence": ["interaction example 1", "interaction example 2"]
  }
]

Focus on concrete, implementable capabilities that address real user needs.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a capability gap analyst. Return only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;

    // Parse suggestions
    let suggestions = [];
    try {
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse capability suggestions:", e);
      suggestions = [];
    }

    console.log(`Discovered ${suggestions.length} capability suggestions`);

    // Store suggestions in database
    const newSuggestions = [];
    for (const suggestion of suggestions) {
      const { data: newSuggestion, error } = await supabase
        .from("capability_suggestions")
        .insert({
          user_id: user.id,
          capability_name: suggestion.capability_name,
          description: suggestion.description,
          reasoning: suggestion.reasoning,
          confidence_score: suggestion.confidence_score || 0.5,
          status: "pending"
        })
        .select()
        .single();

      if (!error && newSuggestion) {
        newSuggestions.push(newSuggestion);
      }
    }

    // Log discovery event
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "capability_discovery",
      description: `Discovered ${suggestions.length} potential new capabilities`,
      change_type: "auto_discovery",
      metrics: {
        suggestions_count: suggestions.length,
        interactions_analyzed: interactions.length,
        avg_user_rating: avgRating,
        existing_capabilities: existingCapabilities?.length || 0
      },
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: newSuggestions,
        analyzed_interactions: interactions.length,
        existing_capabilities: existingCapabilities?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Capability discovery error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
