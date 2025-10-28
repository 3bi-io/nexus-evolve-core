import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId: string | undefined;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const { problem, messages } = await req.json();

    const requestContent = problem || messages?.[messages.length - 1]?.content || "";
    
    if (!requestContent) {
      return new Response(JSON.stringify({ error: "Problem description or messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }
    
    console.log(`Reasoning agent processing: ${requestContent.substring(0, 100)}...`);

    // Step 1: Analyze the problem with enhanced system prompt
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

    const analysisPrompt = `${systemPrompt}\n\nProblem to analyze:\n${requestContent}\n\nProvide a structured analysis with clear reasoning.`;
    
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: analysisPrompt }],
      }),
    });

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices[0].message.content;

    // Step 2: Break down into sub-problems
    const breakdownPrompt = `Based on this analysis:\n\n${analysis}\n\nBreak the problem into 3-5 specific sub-problems or steps.`;
    
    const breakdownResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: breakdownPrompt }],
      }),
    });

    const breakdownData = await breakdownResponse.json();
    const breakdown = breakdownData.choices[0].message.content;

    // Step 3: Generate solution
    const solutionPrompt = `Given this problem breakdown:\n\n${breakdown}\n\nProvide a comprehensive solution with concrete recommendations.`;
    
    const solutionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: solutionPrompt }],
      }),
    });

    const solutionData = await solutionResponse.json();
    const solution = solutionData.choices[0].message.content;

    // Format steps for UI
    const steps = [
      { step: 1, type: "analysis", content: analysis },
      { step: 2, type: "breakdown", content: breakdown },
      { step: 3, type: "solution", content: solution },
    ];

    // Log reasoning session if user authenticated
    if (userId) {
      await supabase.from("evolution_logs").insert({
        user_id: userId,
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

    console.log("Reasoning agent completed successfully");

    return new Response(
      JSON.stringify({ 
        steps, 
        solution,
        agent_type: "reasoning_agent",
        reasoning_steps: steps.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reasoning agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
