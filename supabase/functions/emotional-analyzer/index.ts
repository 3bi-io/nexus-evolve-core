import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("emotional-analyzer", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);

    const body = await req.json();
    validateRequiredFields(body, ["message"]);
    const { message, sessionId, messageId } = body;

    logger.info("Analyzing emotional content", { userId: user.id });

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

    const aiResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an emotional intelligence analyzer." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) throw aiResponse;

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

    logger.info("Emotional analysis complete", { 
      sentiment: analysis.sentiment, 
      intensity: analysis.intensity 
    });

    return successResponse({
      sentiment: analysis.sentiment,
      emotions: analysis.emotions,
      intensity: analysis.intensity,
      tone_adjustment: analysis.tone_adjustment,
      context_id: context.id,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "emotional-analyzer",
      error,
      requestId,
    });
  }
});
