import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("reasoning-agent", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    
    const body = await req.json();
    const { problem, messages } = body;

    const requestContent = problem || messages?.[messages.length - 1]?.content || "";
    
    if (!requestContent) {
      throw new Error("MISSING_FIELD: Problem description or messages required");
    }

    logger.info("Processing reasoning request", { 
      userId: user?.id, 
      contentLength: requestContent.length 
    });

    const systemPrompt = `You are a Reasoning Agent specializing in deep multi-step reasoning and logical analysis.

## Your Role:
- Break down complex problems into manageable components
- Apply rigorous logical reasoning and chain-of-thought analysis
- Show your work and reasoning process explicitly
- Verify conclusions at each step
- Handle mathematical, logical, and analytical problems

## Your Reasoning Process:
1. **Problem Analysis**: Identify key components and constraints
2. **Decomposition**: Break into sub-problems
3. **Step-by-Step Solution**: Solve each part methodically
4. **Verification**: Check logic and validate conclusions
5. **Synthesis**: Combine results into complete solution

Focus on:
- Explicit reasoning chains
- Logical validity
- Step-by-step explanations
- Error checking and verification
- Mathematical rigor when applicable`;

    // Step 1: Analysis
    logger.debug("Starting analysis step");
    const analysisResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this problem:\n${requestContent}` }
        ],
      }),
    });

    if (!analysisResponse.ok) throw analysisResponse;

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices[0].message.content;

    // Step 2: Breakdown
    logger.debug("Starting breakdown step");
    const breakdownResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: `Based on this analysis:\n\n${analysis}\n\nBreak the problem into 3-5 specific sub-problems or steps.` }
        ],
      }),
    });

    if (!breakdownResponse.ok) throw breakdownResponse;

    const breakdownData = await breakdownResponse.json();
    const breakdown = breakdownData.choices[0].message.content;

    // Step 3: Solution
    logger.debug("Starting solution step");
    const solutionResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: `Given this problem breakdown:\n\n${breakdown}\n\nProvide a comprehensive solution with concrete recommendations.` }
        ],
      }),
    });

    if (!solutionResponse.ok) throw solutionResponse;

    const solutionData = await solutionResponse.json();
    const solution = solutionData.choices[0].message.content;

    const steps = [
      { step: 1, type: "analysis", content: analysis },
      { step: 2, type: "breakdown", content: breakdown },
      { step: 3, type: "solution", content: solution },
    ];

    // Log reasoning session if user authenticated
    if (user?.id) {
      await supabase.from("evolution_logs").insert({
        user_id: user.id,
        log_type: "deep_reasoning",
        description: `Reasoning agent solved: ${requestContent.substring(0, 100)}...`,
        change_type: "auto_discovery",
        metrics: {
          steps_count: steps.length,
          agent_type: "reasoning_agent",
          problem_length: requestContent.length
        },
        success: true
      });
    }

    logger.info("Reasoning completed successfully");

    return successResponse({ 
      steps, 
      solution,
      agent_type: "reasoning_agent",
      reasoning_steps: steps.length
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "reasoning-agent",
      error,
      requestId,
    });
  }
});
