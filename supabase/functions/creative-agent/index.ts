import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { requireAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { lovableAIFetch } from "../_shared/api-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger("creative-agent", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);

    const body = await req.json();
    validateRequiredFields(body, ["messages"]);
    const { messages, context } = body;

    logger.info("Processing creative request", { userId: user.id });

    // Fetch creative context
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

    logger.debug("Calling AI with creative prompt");
    const aiResponse = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.9, // Higher temperature for more creativity
      }),
    });

    if (!aiResponse.ok) throw aiResponse;

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

    logger.info("Creative response generated successfully");

    return successResponse({
      response,
      agent_type: "creative_agent",
      context_used: {
        capabilities: capabilities?.length || 0,
        past_solutions: solutions?.length || 0
      }
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "creative-agent",
      error,
      requestId,
    });
  }
});
