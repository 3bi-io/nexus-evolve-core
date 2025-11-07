import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { replicateFetch } from "../_shared/api-client.ts";

interface ReplicateRequest {
  model: string;
  input: Record<string, any>;
  predictionId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("replicate-runner", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info("Processing Replicate request", { userId: user.id });

    const body: ReplicateRequest = await req.json();

    // Check status of existing prediction
    if (body.predictionId) {
      logger.debug("Checking prediction status", { predictionId: body.predictionId });
      
      const statusResponse = await replicateFetch(`/v1/predictions/${body.predictionId}`, {
        method: "GET",
      });

      if (!statusResponse.ok) throw statusResponse;

      const prediction = await statusResponse.json();
      return successResponse(prediction, requestId);
    }

    // Create new prediction
    validateRequiredFields(body, ["model", "input"]);

    logger.info("Creating new prediction", { model: body.model });

    const startTime = Date.now();
    const createResponse = await replicateFetch("/v1/predictions", {
      method: "POST",
      body: JSON.stringify({
        version: body.model,
        input: body.input,
      }),
    });

    if (!createResponse.ok) throw createResponse;

    const prediction = await createResponse.json();
    const latencyMs = Date.now() - startTime;

    // Log the execution
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: body.model,
      task_type: "replicate_inference",
      latency_ms: latencyMs,
      cost_credits: 10,
      success: true,
      metadata: {
        prediction_id: prediction.id,
        status: prediction.status,
        input: body.input
      }
    });

    logger.info("Prediction created", { 
      predictionId: prediction.id,
      latencyMs 
    });

    return successResponse({
      prediction_id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      latency_ms: latencyMs
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "replicate-runner",
      error,
      requestId,
    });
  }
});