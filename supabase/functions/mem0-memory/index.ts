import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const MEM0_API_KEY = Deno.env.get("MEM0_API_KEY");
    if (!MEM0_API_KEY) throw new Error("MEM0_API_KEY not configured");

    const body: MemoryRequest = await req.json();
    const { action } = body;

    console.log(`Mem0 action: ${action}`);

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
        if (!body.memory_id) throw new Error("memory_id required for delete");
        endpoint = `https://api.mem0.ai/v1/memories/${body.memory_id}/`;
        method = "DELETE";
        break;

      case "update":
        if (!body.memory_id) throw new Error("memory_id required for update");
        endpoint = `https://api.mem0.ai/v1/memories/${body.memory_id}/`;
        method = "PUT";
        requestBody = {
          data: body.metadata
        };
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

    // Log the memory operation
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: "mem0",
      task_type: `memory_${action}`,
      latency_ms: latencyMs,
      cost_credits: 1, // Fixed cost for memory operations
      success: true,
      metadata: {
        action,
        result_count: Array.isArray(result?.results) ? result.results.length : 1
      }
    });

    return new Response(
      JSON.stringify({
        result,
        action,
        latency_ms: latencyMs
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Mem0 memory error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
