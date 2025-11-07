import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { xAIFetch } from "../_shared/api-client.ts";

interface VisionRequest {
  imageUrl: string;
  query: string;
  model?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("xai-vision-analyzer", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);

    const body: VisionRequest = await req.json();
    validateRequiredFields(body, ["imageUrl", "query"]);
    const { imageUrl, query, model = "grok-vision-beta" } = body;

    logger.info("Analyzing image", { userId: user.id, query });

    // Check cache first
    const { data: cachedAnalysis } = await supabase
      .from("xai_vision_analysis")
      .select("*")
      .eq("user_id", user.id)
      .eq("image_url", imageUrl)
      .eq("query", query)
      .eq("model", model)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // 1 hour cache
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cachedAnalysis) {
      logger.info("Returning cached vision analysis");
      return successResponse({
        cached: true,
        ...cachedAnalysis,
      }, requestId);
    }

    const startTime = Date.now();

    const response = await xAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
              {
                type: "text",
                text: query,
              },
            ],
          },
        ],
      }),
    }, { timeout: 60000 });

    const processingTime = Date.now() - startTime;

    if (!response.ok) throw response;

    const result = await response.json();
    const analysisText = result.choices?.[0]?.message?.content || "";

    const confidenceScore = 0.85;
    const tokensUsed = result.usage?.total_tokens || 1000;
    const costCredits = (tokensUsed / 1000000) * 5.0;

    // Store analysis in database
    const { data: analysisRecord, error: insertError } = await supabase
      .from("xai_vision_analysis")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        query,
        model,
        analysis_result: {
          text: analysisText,
          raw_response: result,
        },
        confidence_score: confidenceScore,
        processing_time_ms: processingTime,
        cost_credits: costCredits,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to save analysis record", insertError);
    }

    // Log usage analytics
    await supabase.from("xai_usage_analytics").insert({
      user_id: user.id,
      model_id: model,
      feature_type: "vision-analysis",
      tokens_used: tokensUsed,
      cost_credits: costCredits,
      latency_ms: processingTime,
      success: true,
      metadata: { query, image_url: imageUrl },
    });

    logger.info("Vision analysis complete", { processingTime, tokensUsed });

    return successResponse({
      cached: false,
      id: analysisRecord?.id,
      analysis: analysisText,
      confidence_score: confidenceScore,
      processing_time_ms: processingTime,
      cost_credits: costCredits,
      model,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "xai-vision-analyzer",
      error,
      requestId,
    });
  }
});
