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
    const { messages, sessionId, forceAgent } = await req.json();
    
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

    const userMessage = messages[messages.length - 1]?.content || "";
    
    console.log(`Chat with routing: "${userMessage.substring(0, 100)}..."`);

    // PHASE 3C: Intelligent Agent Routing
    let selectedAgent = forceAgent || "general";
    let agentAnalysis = null;

    if (!forceAgent) {
      // Use coordinator to analyze intent and recommend agent(s)
      try {
        const coordinatorResponse = await supabase.functions.invoke("coordinator-agent", {
          body: { message: userMessage, sessionId }
        });

        if (coordinatorResponse.data?.analysis) {
          agentAnalysis = coordinatorResponse.data.analysis;
          const recommended = agentAnalysis.recommended_agents || [];
          
          // For now, use the first recommended agent (future: multi-agent coordination)
          if (recommended.length > 0 && recommended[0] !== "general") {
            selectedAgent = recommended[0];
          }
          
          console.log(`Coordinator recommended: ${recommended.join(", ")} - Using: ${selectedAgent}`);
        }
      } catch (coordError) {
        console.error("Coordinator failed, falling back to general agent:", coordError);
      }
    }

    // Route to appropriate agent based on analysis
    let agentResponse: any;
    let responseText = "";

    if (selectedAgent === "reasoning" || selectedAgent === "reasoning-agent") {
      // Use reasoning agent for deep analysis
      const reasoningResult = await supabase.functions.invoke("reasoning-agent", {
        body: { messages, problem: userMessage }
      });
      
      if (reasoningResult.data) {
        responseText = `## Reasoning Analysis\n\n${reasoningResult.data.solution}`;
        agentResponse = reasoningResult.data;
      }
      
    } else if (selectedAgent === "creative" || selectedAgent === "creative-agent") {
      // Use creative agent for ideation
      const creativeResult = await supabase.functions.invoke("creative-agent", {
        body: { messages }
      });
      
      if (creativeResult.data) {
        responseText = creativeResult.data.response;
        agentResponse = creativeResult.data;
      }
      
    } else if (selectedAgent === "learning" || selectedAgent === "learning-agent") {
      // Use learning agent for meta-analysis
      const learningResult = await supabase.functions.invoke("learning-agent", {
        body: { messages }
      });
      
      if (learningResult.data) {
        responseText = learningResult.data.response;
        agentResponse = learningResult.data;
      }
      
    } else {
      // Default: Use general streaming chat agent with semantic search
      let contextMemories: any[] = [];
      let webSearchContext = "";
      const startTime = Date.now();
      
      // PHASE 1: Check if web search is needed
      const needsWebSearch = agentAnalysis?.requires_web_search || 
                             /(?:latest|recent|current|today|news|weather|stock|price|now)/i.test(userMessage);
      
      if (needsWebSearch) {
        try {
          console.log("[Phase 1] Web search needed, using Tavily");
          const { data: searchResults } = await supabase.functions.invoke("tavily-search", {
            body: { 
              query: userMessage,
              searchDepth: "basic",
              maxResults: 5
            }
          });

          if (searchResults?.answer) {
            webSearchContext = `\n## Real-Time Web Information:\n${searchResults.answer}\n\nSources:\n${
              searchResults.results.map((r: any, i: number) => `${i+1}. ${r.title} - ${r.url}`).join('\n')
            }\n`;
            console.log(`[Phase 1] Tavily found ${searchResults.results.length} results`);
          }
        } catch (searchError) {
          console.error("[Phase 1] Tavily search failed:", searchError);
        }
      }
      
      // PHASE 3E: Semantic Search Integration
      // Try semantic search first for better context retrieval
      try {
        const { data: semanticResults } = await supabase.functions.invoke("semantic-search", {
          body: { 
            query: userMessage,
            table: "agent_memory",
            limit: 5
          }
        });

        if (semanticResults?.results && semanticResults.results.length > 0) {
          contextMemories = semanticResults.results;
          console.log(`Found ${contextMemories.length} semantically relevant memories`);
        }
      } catch (semanticError) {
        console.error("Semantic search failed, falling back to importance-based:", semanticError);
      }

      // Fallback or supplement with importance-based retrieval
      if (contextMemories.length < 5) {
        if (sessionId) {
          const { data: sessionMemories } = await supabase
            .from("agent_memory")
            .select("id, content, memory_type, context_summary, importance_score")
            .eq("user_id", user.id)
            .eq("session_id", sessionId)
            .order("importance_score", { ascending: false })
            .limit(3);
          contextMemories = [...contextMemories, ...(sessionMemories || [])];
        }
        
        const { data: globalMemories } = await supabase
          .from("agent_memory")
          .select("id, content, memory_type, context_summary, importance_score")
          .eq("user_id", user.id)
          .order("importance_score", { ascending: false })
          .limit(5);
        
        contextMemories = [...contextMemories, ...(globalMemories || [])];
      }
      
      // Remove duplicates
      const uniqueMemories = Array.from(
        new Map(contextMemories.map(m => [m.id, m])).values()
      ).slice(0, 10);
      
      // Get adaptive behaviors
      const { data: adaptiveBehaviors } = await supabase
        .from("adaptive_behaviors")
        .select("id, behavior_type, description, effectiveness_score")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("effectiveness_score", { ascending: false })
        .limit(10);

      const memoryContext = uniqueMemories.length > 0
        ? `\n## Context:\n${uniqueMemories.map(m => `- [${m.memory_type}] ${m.context_summary}`).join('\n')}\n`
        : '';

      const behaviorContext = adaptiveBehaviors && adaptiveBehaviors.length > 0
        ? `\n## Style:\n${adaptiveBehaviors.map(b => `- ${b.description}`).join('\n')}\n`
        : '';

      const systemPrompt = `You are a helpful AI assistant with learning capabilities.${behaviorContext}${memoryContext}${webSearchContext}`;

      // PHASE 1: Determine model to use (Claude for complex reasoning, Gemini for general)
      const complexity = agentAnalysis?.complexity || "medium";
      const useClaude = complexity === "high" || forceAgent === "claude";
      const modelUsed = useClaude ? "claude-sonnet-4-20250514" : "google/gemini-2.5-flash";
      
      console.log(`[Phase 1] Using model: ${modelUsed} (complexity: ${complexity})`);

      // Stream response from agent
      let response: Response;
      
      if (useClaude) {
        // Use Claude for complex reasoning
        const claudeResponse = await supabase.functions.invoke("claude-chat", {
          body: { 
            messages: [
              ...messages,
            ],
            systemPrompt,
            maxTokens: 4096
          }
        });
        
        if (!claudeResponse.data) {
          throw new Error("Claude chat failed");
        }
        
        response = new Response(claudeResponse.data, {
          headers: {
            "Content-Type": "text/event-stream",
          }
        });
      } else {
        // Use Gemini Flash for general queries
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          throw new Error(`AI gateway error: ${response.status}`);
        }
      }

      // Store interaction and return stream
      const { data: interactionData } = await supabase.from("interactions").insert({
        user_id: user.id,
        session_id: sessionId,
        message: userMessage,
        context: { 
          agent_used: "general",
          coordinator_analysis: agentAnalysis,
          memories: uniqueMemories.length,
          behaviors: adaptiveBehaviors?.length || 0,
          web_search_used: needsWebSearch,
          model_used: modelUsed
        },
        model_used: modelUsed,
      }).select().single();

      // Buffer and stream response
      const encoder = new TextEncoder();
      let assistantResponse = "";
      let promptTokens = 0;
      let completionTokens = 0;

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              controller.enqueue(value);

              const text = new TextDecoder().decode(value);
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                  try {
                    const json = JSON.parse(line.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                      assistantResponse += content;
                      completionTokens++; // Approximate
                    }
                    // Track token usage if available
                    if (json.usage) {
                      promptTokens = json.usage.prompt_tokens || 0;
                      completionTokens = json.usage.completion_tokens || 0;
                    }
                  } catch {}
                }
              }
            }

            // Update interaction with response
            if (interactionData?.id && assistantResponse) {
              await supabase.from("interactions")
                .update({ response: assistantResponse })
                .eq("id", interactionData.id);
            }

            // PHASE 1: Track LLM observation asynchronously
            const latencyMs = Date.now() - startTime;
            supabase.functions.invoke('track-llm-observation', {
              body: {
                agentType: "general",
                modelUsed: modelUsed,
                promptTokens: promptTokens || Math.ceil(userMessage.length / 4),
                completionTokens: completionTokens || Math.ceil(assistantResponse.length / 4),
                latencyMs: latencyMs,
                userId: user.id,
                sessionId: sessionId,
                metadata: {
                  complexity: complexity,
                  web_search_used: needsWebSearch,
                  memories_used: uniqueMemories.length
                }
              }
            }).catch(err => console.error("[Phase 1] Failed to track observation:", err));

            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream"
        },
      });
    }

    // For non-streaming agents, return JSON response
    await supabase.from("interactions").insert({
      user_id: user.id,
      session_id: sessionId,
      message: userMessage,
      response: responseText,
      context: { 
        agent_used: selectedAgent,
        coordinator_analysis: agentAnalysis,
        agent_response: agentResponse
      },
      model_used: "google/gemini-2.5-flash",
    });

    return new Response(
      JSON.stringify({ 
        response: responseText,
        agent: selectedAgent,
        analysis: agentAnalysis
      }),
      { headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json"
      } }
    );

  } catch (error) {
    console.error("Chat with routing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
