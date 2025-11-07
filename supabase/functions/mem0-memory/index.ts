import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";

interface MemoryRequest {
  action: "add" | "search" | "get" | "delete" | "update";
  messages?: Array<{ role: string; content: string }>;
  memory_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  query?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("mem0-memory", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info("Processing Mem0 request", { userId: user.id });

    const MEM0_API_KEY = Deno.env.get("MEM0_API_KEY");
    if (!MEM0_API_KEY) throw new Error("MEM0_API_KEY not configured");

    const body: MemoryRequest = await req.json();
    const { action } = body;

    validateRequiredFields(body, ["action"]);
    logger.info("Mem0 action", { action });

    let endpoint = "";
    let method = "GET";
    let requestBody: any = null;

    switch (action) {
      case "add":
        endpoint = "https://api.mem0.ai/v1/memories/";
        method = "POST";
        requestBody = {
          messages: body.messages,
          user_id: user.id,
          metadata: body.metadata || {}
        };
        break;

      case "search":
        endpoint = `https://api.mem0.ai/v1/memories/search/?query=${encodeURIComponent(body.query || "")}&user_id=${user.id}&limit=${body.limit || 10}`;
        method = "GET";
        break;

      case "get":
        endpoint = `https://api.mem0.ai/v1/memories/?user_id=${user.id}`;
        method = "GET";
        break;

      case "delete":
        validateRequiredFields(body, ["memory_id"]);
        endpoint = `https://api.mem0.ai/v1/memories/${body.memory_id}/`;
        method = "DELETE";
        break;

      case "update":
        validateRequiredFields(body, ["memory_id"]);
        endpoint = `https://api.mem0.ai/v1/memories/${body.memory_id}/`;
        method = "PUT";
        requestBody = { data: body.metadata };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Token ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mem0 API error: ${error}`);
    }

    const result = await response.json();
    const latencyMs = Date.now() - startTime;

    // Track temporal access for search/get operations
    if ((action === "search" || action === "get") && result?.results) {
      const memoryIds = result.results.map((m: any) => m.id);
      
      logger.debug("Updating temporal scores", { memoryCount: memoryIds.length });
      
      // Update temporal scores for accessed memories
      for (const memoryId of memoryIds) {
        const { data: existingScore } = await supabase
          .from("memory_temporal_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("memory_id", memoryId)
          .maybeSingle();

        if (existingScore) {
          const { data: relevance } = await supabase.rpc('calculate_temporal_relevance', {
            p_access_count: existingScore.access_count + 1,
            p_importance_score: existingScore.importance_score,
            p_last_accessed: new Date().toISOString(),
            p_decay_rate: existingScore.decay_rate
          }) as { data: number };

          await supabase.from("memory_temporal_scores").update({
            access_count: existingScore.access_count + 1,
            last_accessed: new Date().toISOString(),
            calculated_relevance: relevance
          }).eq("id", existingScore.id);
        } else {
          await supabase.from("memory_temporal_scores").insert({
            user_id: user.id,
            memory_id: memoryId,
            access_count: 1,
            last_accessed: new Date().toISOString(),
            calculated_relevance: 0.5
          });
        }
      }

      // Fetch updated temporal scores and re-rank results
      const { data: scores } = await supabase
        .from("memory_temporal_scores")
        .select("*")
        .eq("user_id", user.id)
        .in("memory_id", memoryIds);

      if (scores) {
        result.results = result.results.map((memory: any) => {
          const score = scores.find(s => s.memory_id === memory.id);
          return {
            ...memory,
            temporal_relevance: score?.calculated_relevance || 0.5
          };
        }).sort((a: any, b: any) => (b.temporal_relevance || 0) - (a.temporal_relevance || 0));
      }
    }

    // Log the memory operation
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: "mem0",
      task_type: `memory_${action}`,
      latency_ms: latencyMs,
      cost_credits: 1,
      success: true,
      metadata: {
        action,
        result_count: Array.isArray(result?.results) ? result.results.length : 1
      }
    });

    logger.info("Memory operation completed", { action, latencyMs });

    return successResponse({
      result,
      action,
      latency_ms: latencyMs
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "mem0-memory",
      error,
      requestId,
    });
  }
});