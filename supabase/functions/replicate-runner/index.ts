import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReplicateRequest {
  model: string;
  input: Record<string, any>;
  predictionId?: string;
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

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) throw new Error("REPLICATE_API_KEY not configured");

    const body: ReplicateRequest = await req.json();

    // Check status of existing prediction
    if (body.predictionId) {
      console.log("Checking prediction status:", body.predictionId);
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${body.predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Replicate status check failed: ${statusResponse.status}`);
      }

      const prediction = await statusResponse.json();
      return new Response(
        JSON.stringify(prediction),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new prediction
    if (!body.model || !body.input) {
      throw new Error("Missing required fields: model and input");
    }

    console.log(`Running Replicate model: ${body.model}`);

    const startTime = Date.now();
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: body.model,
        input: body.input,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await createResponse.json();
    const latencyMs = Date.now() - startTime;

    // Log the execution
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: body.model,
      task_type: "replicate_inference",
      latency_ms: latencyMs,
      cost_credits: 10, // Fixed cost for Replicate calls
      success: true,
      metadata: {
        prediction_id: prediction.id,
        status: prediction.status,
        input: body.input
      }
    });

    return new Response(
      JSON.stringify({
        prediction_id: prediction.id,
        status: prediction.status,
        output: prediction.output,
        latency_ms: latencyMs
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Replicate runner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
