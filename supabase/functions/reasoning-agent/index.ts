import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem) {
      return new Response(JSON.stringify({ error: "Problem description required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Step 1: Analyze the problem
    const analysisPrompt = `You are an expert problem solver. Analyze this problem and break it down into key components:\n\n${problem}\n\nProvide a structured analysis.`;
    
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

    return new Response(
      JSON.stringify({ steps, solution }),
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
