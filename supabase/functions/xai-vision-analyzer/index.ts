import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisionRequest {
  imageUrl: string;
  query: string;
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

    const { imageUrl, query, model = "grok-vision-beta" } = await req.json() as VisionRequest;

    console.log(`Analyzing image with query: "${query}"`);

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
      console.log("Returning cached vision analysis");
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          ...cachedAnalysis,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) throw new Error("GROK_API_KEY not configured");

    const startTime = Date.now();

    // Call Grok vision API
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
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
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      
      await supabase.from("xai_usage_analytics").insert({
        user_id: user.id,
        model_id: model,
        feature_type: "vision-analysis",
        success: false,
        error_message: errorText,
        latency_ms: processingTime,
      });

      throw new Error(`Vision analysis failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const analysisText = result.choices?.[0]?.message?.content || "";

    // Calculate confidence score (placeholder, can be enhanced)
    const confidenceScore = 0.85;

    // Estimate cost based on tokens
    const tokensUsed = result.usage?.total_tokens || 1000;
    const costCredits = (tokensUsed / 1000000) * 5.0; // $5 per 1M tokens

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
      console.error("Failed to save analysis record:", insertError);
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

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        id: analysisRecord?.id,
        analysis: analysisText,
        confidence_score: confidenceScore,
        processing_time_ms: processingTime,
        cost_credits: costCredits,
        model,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Vision analysis error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
