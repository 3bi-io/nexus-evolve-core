import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

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

  const requestId = crypto.randomUUID();
  const logger = createLogger("langchain-orchestrator", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info("Processing LangChain task", { userId: user.id });

    const body: ChainRequest = await req.json();
    const { task, input, context, language } = body;

    validateRequiredFields(body, ["task", "input"]);
    logger.info("Executing chain", { task });

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
    const response = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
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

    if (!response.ok) throw response;

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

    logger.info("Chain execution completed", { task, latencyMs });

    return successResponse({
      result: content,
      task,
      latency_ms: latencyMs,
      tokens_used: result.usage?.total_tokens || 0
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "langchain-orchestrator",
      error,
      requestId,
    });
  }
});