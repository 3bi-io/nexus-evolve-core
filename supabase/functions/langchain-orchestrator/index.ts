import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChainRequest {
  task: "summarize" | "qa" | "translate" | "analyze" | "extract";
  input: string;
  context?: string;
  language?: string;
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

    const { task, input, context, language }: ChainRequest = await req.json();

    console.log(`LangChain task: ${task}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build chain based on task type
    let systemPrompt = "";
    let userPrompt = input;

    switch (task) {
      case "summarize":
        systemPrompt = "You are an expert summarizer. Create concise, accurate summaries that capture key points.";
        userPrompt = `Summarize the following text:\n\n${input}`;
        break;
      
      case "qa":
        systemPrompt = "You are a helpful Q&A assistant. Answer questions accurately based on provided context.";
        userPrompt = context 
          ? `Context: ${context}\n\nQuestion: ${input}`
          : `Question: ${input}`;
        break;
      
      case "translate":
        systemPrompt = "You are a professional translator. Provide accurate, natural translations.";
        userPrompt = `Translate the following text to ${language || "English"}:\n\n${input}`;
        break;
      
      case "analyze":
        systemPrompt = "You are an analytical expert. Provide deep insights, patterns, and actionable recommendations.";
        userPrompt = `Analyze the following:\n\n${input}`;
        break;
      
      case "extract":
        systemPrompt = "You are a data extraction specialist. Extract structured information accurately.";
        userPrompt = `Extract key entities, dates, and facts from:\n\n${input}`;
        break;
      
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    // Execute chain with Lovable AI
    const startTime = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: task === "translate" ? 0.3 : 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const result = await response.json();
    const latencyMs = Date.now() - startTime;
    const content = result.choices[0].message.content;

    // Log the chain execution
    await supabase.from("llm_observations").insert({
      user_id: user.id,
      model_name: "google/gemini-2.5-flash",
      task_type: `langchain_${task}`,
      prompt_tokens: result.usage?.prompt_tokens || 0,
      completion_tokens: result.usage?.completion_tokens || 0,
      total_tokens: result.usage?.total_tokens || 0,
      latency_ms: latencyMs,
      cost_credits: ((result.usage?.total_tokens || 0) / 1000) * 2,
      success: true,
      metadata: {
        task,
        input_length: input.length,
        has_context: !!context
      }
    });

    return new Response(
      JSON.stringify({
        result: content,
        task,
        latency_ms: latencyMs,
        tokens_used: result.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("LangChain orchestrator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
