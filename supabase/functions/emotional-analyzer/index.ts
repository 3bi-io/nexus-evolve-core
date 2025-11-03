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

    const { message, sessionId, messageId } = await req.json();

    // Analyze emotional content using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const analysisPrompt = `Analyze the emotional content of this message:

"${message}"

Provide:
1. Primary sentiment (positive, negative, neutral, mixed)
2. Emotion scores (joy, sadness, anger, fear, surprise, disgust) - each 0.0-1.0
3. Intensity (0.0-1.0)
4. Suggested tone adjustment (supportive, empathetic, professional, enthusiastic, calming)

Format as JSON:
{
  "sentiment": "positive",
  "emotions": {
    "joy": 0.8,
    "sadness": 0.0,
    "anger": 0.0,
    "fear": 0.0,
    "surprise": 0.2,
    "disgust": 0.0
  },
  "intensity": 0.7,
  "tone_adjustment": "enthusiastic"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an emotional intelligence analyzer." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      sentiment: "neutral",
      emotions: {},
      intensity: 0.5,
      tone_adjustment: "professional",
    };

    // Store emotional context
    const { data: context, error } = await supabase
      .from("emotional_context")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        message_id: messageId,
        detected_sentiment: analysis.sentiment,
        emotion_scores: analysis.emotions,
        intensity: analysis.intensity,
        response_tone_adjustment: analysis.tone_adjustment,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Emotional analysis: ${analysis.sentiment} (intensity: ${analysis.intensity})`);

    return new Response(JSON.stringify({
      sentiment: analysis.sentiment,
      emotions: analysis.emotions,
      intensity: analysis.intensity,
      tone_adjustment: analysis.tone_adjustment,
      context_id: context.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in emotional-analyzer:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});