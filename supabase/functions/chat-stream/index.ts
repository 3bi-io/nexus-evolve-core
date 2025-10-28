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
    const { messages, sessionId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token || "");
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Retrieve relevant context from agent memory - INTELLIGENT RETRIEVAL
    let contextMemories: Array<{ id: string; content: any; memory_type: string; context_summary: string; importance_score: number }> = [];
    
    if (sessionId) {
      // Strategy 1: Get high-importance memories from current session
      const { data: sessionMemories } = await supabase
        .from("agent_memory")
        .select("id, content, memory_type, context_summary, importance_score")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .order("importance_score", { ascending: false })
        .limit(3);
      
      contextMemories = sessionMemories || [];
    }
    
    // Strategy 2: Get globally important memories across all sessions
    const { data: globalMemories } = await supabase
      .from("agent_memory")
      .select("id, content, memory_type, context_summary, importance_score")
      .eq("user_id", user.id)
      .order("importance_score", { ascending: false })
      .order("last_retrieved_at", { ascending: false, nullsFirst: false })
      .limit(5);
    
    // Combine and deduplicate memories
    const allMemories = [...contextMemories, ...(globalMemories || [])];
    const uniqueMemories = Array.from(
      new Map(allMemories.map(m => [m.id, m])).values()
    ).slice(0, 10);
    
    contextMemories = uniqueMemories;
    
    // Track memory retrieval
    for (const memory of contextMemories) {
      await supabase.rpc('increment_memory_retrieval', { memory_id: memory.id });
    }

    // Fetch adaptive behaviors for dynamic prompt construction (PHASE 3B)
    const { data: adaptiveBehaviors } = await supabase
      .from("adaptive_behaviors")
      .select("id, behavior_type, description, effectiveness_score")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("effectiveness_score", { ascending: false })
      .limit(10);

    // Fetch enabled capabilities
    const { data: capabilities } = await supabase
      .from("capability_modules")
      .select("capability_name, description")
      .eq("user_id", user.id)
      .eq("is_enabled", true);

    // Build user performance summary for prompt context
    const { data: recentRatings } = await supabase
      .from("interactions")
      .select("quality_rating")
      .eq("user_id", user.id)
      .not("quality_rating", "is", null)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    const avgRating = recentRatings && recentRatings.length > 0
      ? recentRatings.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / recentRatings.length
      : 0;

    // Build dynamic multi-layered system prompt (PHASE 3B)
    const memoryContext = contextMemories.length > 0
      ? `\n## Relevant Context & Learnings:\n${contextMemories.map(m => 
          `- [${m.memory_type}] ${m.context_summary}${m.content ? '\n  ' + JSON.stringify(m.content) : ''}`
        ).join('\n')}\n`
      : '';

    const behaviorContext = adaptiveBehaviors && adaptiveBehaviors.length > 0
      ? `\n## Your Communication Style (learned from user feedback):\n${adaptiveBehaviors.map(b => 
          `- ${b.description} (effectiveness: ${(b.effectiveness_score * 100).toFixed(0)}%)`
        ).join('\n')}\n`
      : '';

    const capabilityContext = capabilities && capabilities.length > 0
      ? `\n## Active Capabilities:\n${capabilities.map(c => `- ${c.capability_name}: ${c.description}`).join('\n')}\n`
      : '';

    const performanceContext = recentRatings && recentRatings.length > 0
      ? `\n## Performance Goals:\n- Current user satisfaction: ${(avgRating * 100 + 50).toFixed(0)}% (based on ${recentRatings.length} recent ratings)\n- Continue adapting to user preferences and improving response quality\n`
      : '';

    const systemPrompt = `You are an advanced AI assistant with learning capabilities and access to accumulated knowledge.
${behaviorContext}${capabilityContext}${memoryContext}${performanceContext}
## Guidelines:
- Provide clear, accurate, and helpful responses
- Apply learned communication preferences from user feedback
- Reference past learnings when relevant to the conversation
- Show your reasoning for complex problems
- Adapt your responses based on context and user preferences`;

    console.log(`Dynamic prompt: ${uniqueMemories.length} memories, ${adaptiveBehaviors?.length || 0} behaviors, ${capabilities?.length || 0} capabilities`);

    // Track which behaviors are being used for effectiveness tracking
    const usedBehaviorIds = adaptiveBehaviors?.map(b => b.id) || [];

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store user message and get interaction ID
    const userMessage = messages[messages.length - 1]?.content || "";
    const { data: interactionData } = await supabase.from("interactions").insert({
      user_id: user.id,
      session_id: sessionId,
      message: userMessage,
      context: { 
        memories_used: contextMemories.length,
        memory_ids: contextMemories.map(m => m.id),
        memory_types: contextMemories.map(m => m.memory_type),
        behavior_ids: usedBehaviorIds,
        capability_count: capabilities?.length || 0,
      },
      model_used: "google/gemini-2.5-flash",
    }).select().single();

    const interactionId = interactionData?.id;

    // Stream response and buffer it
    const encoder = new TextEncoder();
    let assistantResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Forward to client
            controller.enqueue(value);

            // Buffer response for storage
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) assistantResponse += content;
                } catch {}
              }
            }
          }

          // Store complete response after streaming
          if (interactionId && assistantResponse) {
            await supabase.from("interactions")
              .update({ response: assistantResponse })
              .eq("id", interactionId);
            
            // Update behavior application tracking (PHASE 3B)
            if (usedBehaviorIds.length > 0) {
              for (const behaviorId of usedBehaviorIds) {
                // Get current count and increment
                const { data: currentBehavior } = await supabase
                  .from("adaptive_behaviors")
                  .select("application_count")
                  .eq("id", behaviorId)
                  .single();
                
                if (currentBehavior) {
                  await supabase
                    .from("adaptive_behaviors")
                    .update({ 
                      last_applied_at: new Date().toISOString(),
                      application_count: (currentBehavior.application_count || 0) + 1
                    })
                    .eq("id", behaviorId);
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
