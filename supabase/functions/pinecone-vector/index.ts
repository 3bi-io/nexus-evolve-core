import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";

interface PineconeRequest {
  action: "upsert" | "query" | "delete" | "fetch" | "list";
  namespace?: string;
  vectors?: Array<{
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }>;
  query_vector?: number[];
  top_k?: number;
  filter?: Record<string, any>;
  ids?: string[];
  text?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("pinecone-vector", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info("Processing Pinecone request", { userId: user.id });

    const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY");
    const PINECONE_HOST = Deno.env.get("PINECONE_HOST");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!PINECONE_API_KEY) throw new Error("PINECONE_API_KEY not configured");
    if (!PINECONE_HOST) throw new Error("PINECONE_HOST not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body: PineconeRequest = await req.json();
    const { action, namespace = "default" } = body;

    validateRequiredFields(body, ["action"]);
    logger.info("Pinecone action", { action, namespace });

    let endpoint = "";
    let method = "POST";
    let requestBody: any = null;

    // Generate embeddings if text is provided
    let queryVector = body.query_vector;
    if (body.text && (action === "query" || action === "upsert")) {
      logger.debug("Generating embeddings for text");
      
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: body.text,
        }),
      });

      if (!embeddingResponse.ok) {
        throw new Error("Failed to generate embeddings");
      }

      const embeddingResult = await embeddingResponse.json();
      queryVector = embeddingResult.data[0].embedding;
    }

    switch (action) {
      case "upsert":
        endpoint = `${PINECONE_HOST}/vectors/upsert`;
        requestBody = { vectors: body.vectors, namespace };
        break;

      case "query":
        if (!queryVector) throw new Error("query_vector or text required for query");
        endpoint = `${PINECONE_HOST}/query`;
        requestBody = {
          vector: queryVector,
          topK: body.top_k || 10,
          namespace,
          filter: body.filter,
          includeMetadata: true,
        };
        break;

      case "delete":
        endpoint = `${PINECONE_HOST}/vectors/delete`;
        requestBody = { ids: body.ids, namespace };
        break;

      case "fetch":
        endpoint = `${PINECONE_HOST}/vectors/fetch`;
        requestBody = { ids: body.ids, namespace };
        break;

      case "list":
        endpoint = `${PINECONE_HOST}/vectors/list?namespace=${namespace}`;
        method = "GET";
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone API error: ${error}`);
    }

    const result = await response.json();
    const latencyMs = Date.now() - startTime;

    // Log the vector operation
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: "pinecone",
      task_type: `vector_${action}`,
      latency_ms: latencyMs,
      cost_credits: 2,
      success: true,
      metadata: {
        action,
        namespace,
        result_count: action === "query" ? result.matches?.length : body.vectors?.length || body.ids?.length || 0,
      },
    });

    logger.info("Operation completed", { action, latencyMs });

    return successResponse({
      result,
      action,
      latency_ms: latencyMs,
    }, requestId);
  } catch (error) {
    return handleError({
      functionName: "pinecone-vector",
      error,
      requestId,
    });
  }
});