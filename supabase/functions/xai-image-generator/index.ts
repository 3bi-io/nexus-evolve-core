import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { xAIFetch } from "../_shared/api-client.ts";

interface ImageGenRequest {
  prompt: string;
  negativePrompt?: string;
  numImages?: number;
  model?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("xai-image-generator", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    const body: ImageGenRequest = await req.json();
    validateRequiredFields(body, ["prompt"]);
    const { prompt, negativePrompt, numImages = 1, model = "grok-2-image-1212" } = body;

    logger.info("Generating images", { 
      userId: user?.id || "anonymous", 
      numImages, 
      promptPreview: prompt.substring(0, 50) 
    });

    const startTime = Date.now();

    const response = await xAIFetch("/v1/images/generations", {
      method: "POST",
      body: JSON.stringify({
        model,
        prompt,
        negative_prompt: negativePrompt,
        n: numImages,
      }),
    }, { timeout: 60000 });

    const generationTime = Date.now() - startTime;

    if (!response.ok) throw response;

    const result = await response.json();
    const imageUrls = result.data?.map((img: any) => img.url) || [];

    const costCredits = numImages * 0.05;

    // Store in database (only for authenticated users)
    let imageRecord = null;
    if (!isAnonymous) {
      const { data, error: insertError } = await supabase
        .from("xai_generated_images")
        .insert({
          user_id: user.id,
          prompt,
          negative_prompt: negativePrompt,
          model,
          num_images: numImages,
          image_urls: imageUrls,
          image_data: result.data,
          generation_time_ms: generationTime,
          cost_credits: costCredits,
          settings: { model, numImages },
        })
        .select()
        .single();

      if (insertError) {
        logger.error("Failed to save image record", insertError);
      }
      imageRecord = data;

      // Log usage analytics
      await supabase.from("xai_usage_analytics").insert({
        user_id: user.id,
        model_id: model,
        feature_type: "image-generation",
        cost_credits: costCredits,
        latency_ms: generationTime,
        success: true,
        metadata: { prompt, num_images: numImages },
      });
    }

    logger.info("Image generation complete", { generationTime, numImages });

    return successResponse({
      id: imageRecord?.id,
      images: imageUrls,
      prompt,
      model,
      generation_time_ms: generationTime,
      cost_credits: costCredits,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "xai-image-generator",
      error,
      requestId,
    });
  }
});
