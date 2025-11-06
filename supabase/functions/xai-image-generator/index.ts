import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { prompt, negativePrompt, numImages = 1, model = "grok-2-image-1212" } = await req.json() as ImageGenRequest;

    console.log(`Generating ${numImages} images with prompt: "${prompt}"`);

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) throw new Error("GROK_API_KEY not configured");

    const startTime = Date.now();

    // Call Grok image generation API
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        negative_prompt: negativePrompt,
        n: numImages,
      }),
    });

    const generationTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      
      // Log failure
      await supabase.from("xai_usage_analytics").insert({
        user_id: user.id,
        model_id: model,
        feature_type: "image-generation",
        success: false,
        error_message: errorText,
        latency_ms: generationTime,
      });

      throw new Error(`Image generation failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const imageUrls = result.data?.map((img: any) => img.url) || [];

    // Calculate cost (estimated $0.05 per image)
    const costCredits = numImages * 0.05;

    // Store in database
    const { data: imageRecord, error: insertError } = await supabase
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
      console.error("Failed to save image record:", insertError);
    }

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

    return new Response(
      JSON.stringify({
        success: true,
        id: imageRecord?.id,
        images: imageUrls,
        prompt,
        model,
        generation_time_ms: generationTime,
        cost_credits: costCredits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
