import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComputerUseRequest {
  task: string;
  context?: string;
  max_steps?: number;
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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const { task, context, max_steps = 5 }: ComputerUseRequest = await req.json();

    console.log(`Computer Use task: ${task}`);

    const systemPrompt = `You are a computer use agent with access to tools for web browsing, screenshot analysis, and task automation.
Your goal is to complete the user's task efficiently and accurately.

${context ? `Additional context: ${context}` : ""}`;

    const startTime = Date.now();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: task,
          },
        ],
        tools: [
          {
            type: "computer_20241022",
            name: "computer",
            display_width_px: 1920,
            display_height_px: 1080,
            display_number: 1,
          },
          {
            type: "text_editor_20241022",
            name: "str_replace_editor",
          },
          {
            type: "bash_20241022",
            name: "bash",
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const result = await response.json();
    const latencyMs = Date.now() - startTime;

    // Extract results
    const textContent = result.content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n");

    const toolUses = result.content.filter((c: any) => c.type === "tool_use");

    // Log the computer use session
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: "claude-sonnet-4-5",
      task_type: "computer_use",
      prompt_tokens: result.usage?.input_tokens || 0,
      completion_tokens: result.usage?.output_tokens || 0,
      total_tokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
      latency_ms: latencyMs,
      cost_credits: (((result.usage?.input_tokens || 0) * 3) + ((result.usage?.output_tokens || 0) * 15)) / 1000000,
      success: true,
      metadata: {
        tool_uses: toolUses.length,
        stop_reason: result.stop_reason,
      },
    });

    return new Response(
      JSON.stringify({
        result: textContent,
        tool_uses: toolUses,
        stop_reason: result.stop_reason,
        usage: result.usage,
        latency_ms: latencyMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Computer use error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
