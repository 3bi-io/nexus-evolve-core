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

    console.log("Analyzing usage patterns to predict needed capabilities...");

    // Get recent interactions
    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get current capabilities
    const { data: currentCapabilities } = await supabase
      .from("capability_modules")
      .select("capability_key")
      .eq("user_id", user.id)
      .eq("enabled", true);

    const currentKeys = currentCapabilities?.map(c => c.capability_key) || [];

    // Analyze patterns using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const analysisPrompt = `Analyze these user interactions and predict what capabilities they might need next:

Recent Activity:
${interactions?.slice(0, 20).map(i => `- ${i.user_query}`).join("\n")}

Current Capabilities: ${currentKeys.join(", ")}

Predict 3-5 capabilities this user is likely to need soon. For each:
1. Capability name (short, descriptive)
2. Confidence score (0.0-1.0)
3. Reasoning (why they'll need it)

Format as JSON array:
[
  {
    "capability": "capability_name",
    "confidence": 0.85,
    "reasoning": "explanation"
  }
]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a predictive AI analyzing usage patterns." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const predictions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Store predictions
    const stored = [];
    for (const pred of predictions) {
      const { data, error } = await supabase
        .from("capability_predictions")
        .insert({
          user_id: user.id,
          predicted_capability: pred.capability,
          confidence_score: pred.confidence,
          reasoning: pred.reasoning,
          status: "predicted",
        })
        .select()
        .single();

      if (!error) stored.push(data);
    }

    // Log prediction event
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "capability_prediction",
      description: `Predicted ${predictions.length} capabilities`,
      metadata: { predictions },
    });

    console.log(`Predicted ${predictions.length} capabilities`);

    return new Response(JSON.stringify({
      predictions: stored,
      analyzed_interactions: interactions?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in predict-capabilities:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});