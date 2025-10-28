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
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");

    const { messages, context } = await req.json();

    console.log(`Creative agent processing request for user ${user.id}`);

    // Fetch creative context: past solutions, novel approaches
    const { data: solutions } = await supabase
      .from("problem_solutions")
      .select("*")
      .eq("user_id", user.id)
      .order("success_score", { ascending: false })
      .limit(10);

    const { data: capabilities } = await supabase
      .from("capability_modules")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_enabled", true);

    // Build creative-focused system prompt
    const systemPrompt = `You are a Creative Agent specializing in ideation, brainstorming, and innovative problem-solving.

## Your Role:
- Generate creative and novel solutions to problems
- Think divergently and explore multiple possibilities
- Use analogical reasoning to find connections between disparate concepts
- Encourage out-of-the-box thinking
- Generate ideas without immediate concern for feasibility

## Available Capabilities:
${capabilities?.map(c => `- ${c.capability_name}: ${c.description}`).join('\n') || 'None yet'}

## Past Successful Approaches:
${solutions?.slice(0, 5).map(s => `- Problem: ${s.problem_description}\n  Success: ${(s.success_score || 0) * 100}%`).join('\n') || 'No past solutions yet'}

## Your Creative Process:
1. **Divergent Thinking**: Generate multiple diverse ideas
2. **Analogical Reasoning**: Draw parallels from unrelated domains
3. **Constraint Removal**: Challenge assumptions and explore "what if" scenarios
4. **Synthesis**: Combine ideas in novel ways
5. **Imaginative Exploration**: Push boundaries of conventional thinking

## Creative Techniques:
- Lateral thinking and perspective shifts
- SCAMPER method (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse)
- Random association and forced connections
- Future-back thinking (imagine ideal outcome, work backwards)
- Metaphorical thinking and storytelling

Focus on:
- Quantity over quality (generate many ideas)
- Wild ideas are welcome
- Building on and combining ideas
- Visual and concrete examples
- Playful and experimental approaches`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.9, // Higher temperature for more creativity
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const response = aiResult.choices[0].message.content;

    // Log creative session
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "creative_ideation",
      description: `Creative agent generated ideas for: ${messages[messages.length - 1]?.content?.substring(0, 100)}...`,
      change_type: "auto_discovery",
      metrics: {
        capabilities_used: capabilities?.length || 0,
        past_solutions_referenced: solutions?.length || 0,
        agent_type: "creative_agent",
        temperature: 0.9
      },
      success: true
    });

    console.log("Creative agent response generated successfully");

    return new Response(
      JSON.stringify({
        response,
        agent_type: "creative_agent",
        context_used: {
          capabilities: capabilities?.length || 0,
          past_solutions: solutions?.length || 0
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Creative agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
