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
    const { sessionId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token || "");

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all interactions from this session
    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!interactions || interactions.length === 0) {
      return new Response(JSON.stringify({ message: "No interactions to analyze" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build conversation summary for AI analysis
    const conversationText = interactions
      .map((i) => `User: ${i.message}\nAssistant: ${i.response || ""}`)
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to extract learnings
    const analysisPrompt = `Analyze this conversation and extract key learnings:

${conversationText}

Extract:
1. Important facts about the user (preferences, context, background)
2. Key topics discussed
3. Problems solved and solutions used
4. Recurring patterns or themes

Format your response as JSON with these keys:
- facts: array of user facts
- topics: array of main topics
- solutions: array of {problem, solution, reasoning}
- patterns: array of observed patterns`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at analyzing conversations and extracting insights." },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze conversation");
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);

    // Store learnings in appropriate tables
    const learningsStored = {
      facts: 0,
      topics: 0,
      solutions: 0,
      patterns: 0,
    };

    // Store facts as agent memory
    if (analysis.facts && Array.isArray(analysis.facts)) {
      for (const fact of analysis.facts) {
        await supabase.from("agent_memory").insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: "fact",
          content: { fact },
          importance_score: 0.7,
        });
        learningsStored.facts++;
      }
    }

    // Store topics in knowledge base
    if (analysis.topics && Array.isArray(analysis.topics)) {
      for (const topic of analysis.topics) {
        await supabase.from("knowledge_base").insert({
          user_id: user.id,
          content: topic,
          source_type: "conversation",
          source_reference: sessionId,
          tags: ["topic"],
          importance_score: 0.6,
        });
        learningsStored.topics++;
      }
    }

    // Store solutions
    if (analysis.solutions && Array.isArray(analysis.solutions)) {
      for (const sol of analysis.solutions) {
        await supabase.from("problem_solutions").insert({
          user_id: user.id,
          problem_description: sol.problem,
          solution_path: { solution: sol.solution },
          reasoning_steps: { reasoning: sol.reasoning },
          success_score: 0.8,
        });
        learningsStored.solutions++;
      }
    }

    // Store patterns as agent memory
    if (analysis.patterns && Array.isArray(analysis.patterns)) {
      for (const pattern of analysis.patterns) {
        await supabase.from("agent_memory").insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: "context",
          content: { pattern },
          importance_score: 0.75,
        });
        learningsStored.patterns++;
      }
    }

    // Log the learning extraction
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      change_type: "performance_improvement",
      description: "Extracted learnings from conversation",
      metrics: learningsStored,
      success: true,
    });

    return new Response(
      JSON.stringify({ message: "Learnings extracted successfully", learningsStored }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract learnings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
