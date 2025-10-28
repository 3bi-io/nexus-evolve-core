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
    
    // Retrieve relevant context from agent memory
    let contextMemories: Array<{ content: any; memory_type: string }> = [];
    if (sessionId) {
      const { data: memories } = await supabase
        .from("agent_memory")
        .select("content, memory_type")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .order("importance_score", { ascending: false })
        .limit(5);
      
      contextMemories = memories || [];
    }

    // Build system prompt with context
    const systemPrompt = `You are an advanced AI assistant with access to accumulated knowledge and context. You can reason deeply, learn from interactions, and provide thoughtful, comprehensive responses.

${contextMemories.length > 0 ? `
Recent Context:
${contextMemories.map(m => `- [${m.memory_type}] ${JSON.stringify(m.content)}`).join('\n')}
` : ''}

Guidelines:
- Provide clear, accurate, and helpful responses
- Show your reasoning when solving complex problems
- Learn from the conversation and adapt your responses
- Be concise but thorough
- Ask clarifying questions when needed`;

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
      context: { memories_used: contextMemories.length },
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
