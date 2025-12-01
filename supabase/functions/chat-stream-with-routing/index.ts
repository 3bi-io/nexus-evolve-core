import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, streamResponse } from "../_shared/error-handler.ts";
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
  const logger = createLogger("chat-stream-with-routing", requestId);

  try {
    const supabase = initSupabaseClient();
    
    // Allow both authenticated and anonymous users
    let user = null;
    let isAnonymous = false;
    
    try {
      user = await requireAuth(req, supabase);
    } catch (authError) {
      // Anonymous user - provide basic chat without persistence
      isAnonymous = true;
      user = { id: 'anonymous-' + crypto.randomUUID(), email: null };
      logger.info("Anonymous user chat request");
    }

    const body = await req.json();
    validateRequiredFields(body, ["messages"]);
    const { messages, sessionId, forceAgent } = body;

    const userMessage = messages[messages.length - 1]?.content || "";
    
    logger.info("Chat request with routing", { 
      userId: user.id, 
      sessionId, 
      isAnonymous,
      messagePreview: userMessage.substring(0, 100)
    });

    // PHASE 3C: Intelligent Agent Routing
    let selectedAgent = forceAgent || "general";
    let agentAnalysis = null;

    if (!forceAgent) {
      try {
        logger.debug("Calling coordinator for agent routing");
        const coordinatorResponse = await supabase.functions.invoke("coordinator-agent", {
          body: { message: userMessage, sessionId }
        });

        if (coordinatorResponse.data?.analysis) {
          agentAnalysis = coordinatorResponse.data.analysis;
          const recommended = agentAnalysis.recommended_agents || [];
          
          if (recommended.length > 0 && recommended[0] !== "general") {
            selectedAgent = recommended[0];
          }
          
          logger.info("Coordinator recommendation", { 
            recommended: recommended.join(", "), 
            selected: selectedAgent 
          });
        }
      } catch (coordError) {
        logger.error("Coordinator failed, falling back to general", coordError);
      }
    }

    // Route to specialized agents if selected
    if (selectedAgent === "reasoning" || selectedAgent === "reasoning-agent") {
      return await routeToReasoningAgent(supabase, messages, userMessage, user, sessionId, requestId, isAnonymous);
    } else if (selectedAgent === "creative" || selectedAgent === "creative-agent") {
      return await routeToCreativeAgent(supabase, messages, user, sessionId, requestId, isAnonymous);
    } else if (selectedAgent === "learning" || selectedAgent === "learning-agent") {
      return await routeToLearningAgent(supabase, messages, user, sessionId, requestId, isAnonymous);
    } else if (selectedAgent.startsWith("kimi-")) {
      return await routeToKimiModel(supabase, messages, userMessage, user, sessionId, selectedAgent, requestId, isAnonymous);
    } else if (selectedAgent === "negotiator") {
      return await routeToNegotiationAgent(supabase, messages, userMessage, user, sessionId, requestId, isAnonymous);
    }

    // General agent with streaming
    return await handleGeneralAgent(
      supabase, 
      user, 
      messages, 
      userMessage, 
      sessionId, 
      agentAnalysis, 
      forceAgent,
      logger,
      requestId,
      isAnonymous
    );

  } catch (error) {
    return handleError({
      functionName: "chat-stream-with-routing",
      error,
      requestId,
    });
  }
});

async function routeToReasoningAgent(
  supabase: any, 
  messages: any[], 
  userMessage: string, 
  user: any, 
  sessionId: string,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const logger = createLogger("chat-stream-with-routing", requestId);
  
  logger.debug("Routing to reasoning agent");
  const reasoningResult = await supabase.functions.invoke("reasoning-agent", {
    body: { messages, problem: userMessage }
  });
  
  if (reasoningResult.data) {
    const responseText = `## Reasoning Analysis\n\n${reasoningResult.data.solution}`;
    
    // Skip database operations for anonymous users
    if (!isAnonymous) {
      await supabase.from("interactions").insert({
        user_id: user.id,
        session_id: sessionId,
        message: userMessage,
        response: responseText,
        model_used: 'oneiros-ai',
        context: { agent_used: "reasoning", session_id: sessionId }
      });
    }

    return new Response(
      JSON.stringify({ response: responseText, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  throw new Error("Reasoning agent failed");
}

async function routeToCreativeAgent(
  supabase: any, 
  messages: any[], 
  user: any, 
  sessionId: string,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const logger = createLogger("chat-stream-with-routing", requestId);
  const userMessage = messages[messages.length - 1]?.content || "";
  
  logger.debug("Routing to creative agent");
  const creativeResult = await supabase.functions.invoke("creative-agent", {
    body: { messages }
  });
  
  if (creativeResult.data) {
    const responseText = creativeResult.data.response;
    
    // Skip database operations for anonymous users
    if (!isAnonymous) {
      await supabase.from("interactions").insert({
        user_id: user.id,
        session_id: sessionId,
        message: userMessage,
        response: responseText,
        model_used: 'oneiros-ai',
        context: { agent_used: "creative", session_id: sessionId }
      });
    }

    return new Response(
      JSON.stringify({ response: responseText, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  throw new Error("Creative agent failed");
}

async function routeToLearningAgent(
  supabase: any, 
  messages: any[], 
  user: any, 
  sessionId: string,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const logger = createLogger("chat-stream-with-routing", requestId);
  const userMessage = messages[messages.length - 1]?.content || "";
  
  logger.debug("Routing to learning agent");
  const learningResult = await supabase.functions.invoke("learning-agent", {
    body: { messages }
  });
  
  if (learningResult.data) {
    const responseText = learningResult.data.response;
    
    // Skip database operations for anonymous users
    if (!isAnonymous) {
      await supabase.from("interactions").insert({
        user_id: user.id,
        session_id: sessionId,
        message: userMessage,
        response: responseText,
        model_used: 'oneiros-ai',
        context: { agent_used: "learning", session_id: sessionId }
      });
    }

    return new Response(
      JSON.stringify({ response: responseText, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  throw new Error("Learning agent failed");
}

async function routeToNegotiationAgent(
  supabase: any,
  messages: any[],
  userMessage: string,
  user: any,
  sessionId: string,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const logger = createLogger("chat-stream-with-routing", requestId);
  
  logger.info("Routing to negotiation agent (Zara)");
  
  const negotiationResult = await supabase.functions.invoke("negotiate-agent", {
    body: { 
      message: userMessage,
      session_id: sessionId,
      persona: "zara"
    }
  });
  
  if (negotiationResult.error) {
    logger.error("Negotiation agent error", negotiationResult.error);
    throw new Error(negotiationResult.error.message || "Negotiation agent failed");
  }
  
  if (negotiationResult.data) {
    const { response, cumulative_score, current_price, round_number } = negotiationResult.data;
    
    // Format response with score indicator (visible to user)
    const formattedResponse = `${response}\n\n---\n*🎯 Score: ${cumulative_score} | 💰 Current Price: $${current_price.toFixed(2)} | Round ${round_number}*`;
    
    // Skip database operations for anonymous users
    if (!isAnonymous) {
      await supabase.from("interactions").insert({
        user_id: user.id,
        session_id: sessionId,
        message: userMessage,
        response: formattedResponse,
        model_used: 'negotiator-zara',
        context: { 
          agent_used: "negotiator", 
          session_id: sessionId,
          cumulative_score,
          current_price,
          round_number
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        response: formattedResponse, 
        success: true,
        negotiation: {
          cumulative_score,
          current_price,
          round_number
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  throw new Error("Negotiation agent failed");
}

async function routeToKimiModel(
  supabase: any,
  messages: any[],
  userMessage: string,
  user: any,
  sessionId: string,
  selectedAgent: string,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const logger = createLogger("chat-stream-with-routing", requestId);
  
  const modelMap: Record<string, string> = {
    "kimi-8k": "moonshot-v1-8k",
    "kimi-32k": "moonshot-v1-32k",
    "kimi-128k": "moonshot-v1-128k"
  };
  
  const kimiModel = modelMap[selectedAgent] || "moonshot-v1-32k";
  logger.info("Routing to Kimi model", { selectedAgent, kimiModel });
  
  const kimiResponse = await supabase.functions.invoke("moonshot-chat", {
    body: { 
      messages,
      model: kimiModel,
      temperature: 0.7,
      maxTokens: 4096
    }
  });
  
  if (kimiResponse.error) {
    logger.error("Kimi model error", kimiResponse.error);
    throw new Error(kimiResponse.error.message || "Kimi model failed");
  }
  
  // Store interaction (skip for anonymous users)
  if (!isAnonymous) {
    await supabase.from("interactions").insert({
      user_id: user.id,
      session_id: sessionId,
      message: userMessage,
      response: "[Streaming response from Kimi]",
      model_used: kimiModel,
      context: { agent_used: selectedAgent, session_id: sessionId }
    });
  }
  
  // Return the streaming response
  if (kimiResponse.data) {
    return new Response(kimiResponse.data, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }
  
  throw new Error("Kimi model returned no data");
}

async function handleGeneralAgent(
  supabase: any,
  user: any,
  messages: any[],
  userMessage: string,
  sessionId: string,
  agentAnalysis: any,
  forceAgent: string | undefined,
  logger: any,
  requestId: string,
  isAnonymous: boolean = false
): Promise<Response> {
  const startTime = Date.now();
  let contextMemories: any[] = [];
  let webSearchContext = "";
  
  // PHASE 1: Check if web search is needed
  const needsWebSearch = agentAnalysis?.requires_web_search || 
                         /(?:latest|recent|current|today|news|weather|stock|price|now)/i.test(userMessage);
  
  if (needsWebSearch) {
    try {
      logger.debug("Performing web search");
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
        logger.debug("Web search completed", { resultsCount: searchResults.results.length });
      }
    } catch (searchError) {
      logger.error("Web search failed", searchError);
    }
  }
  
  // PHASE 3E: Semantic Search Integration (skip for anonymous users)
  if (!isAnonymous) {
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
        logger.debug("Semantic search completed", { memoriesFound: contextMemories.length });
      }
    } catch (semanticError) {
      logger.error("Semantic search failed", semanticError);
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
      ? `\n## Style:\n${adaptiveBehaviors.map((b: any) => `- ${b.description}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are a helpful AI assistant with learning capabilities.${behaviorContext}${memoryContext}${webSearchContext}`;
  } else {
    // Anonymous users get basic system prompt without personalization
    const systemPrompt = `You are a helpful AI assistant.${webSearchContext}`;
  }

  const uniqueMemories = isAnonymous ? [] : Array.from(
    new Map(contextMemories.map(m => [m.id, m])).values()
  ).slice(0, 10);
  
  const adaptiveBehaviors = isAnonymous ? [] : (await supabase
    .from("adaptive_behaviors")
    .select("id, behavior_type, description, effectiveness_score")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("effectiveness_score", { ascending: false })
    .limit(10)).data;

  const memoryContext = uniqueMemories.length > 0
    ? `\n## Context:\n${uniqueMemories.map(m => `- [${m.memory_type}] ${m.context_summary}`).join('\n')}\n`
    : '';

  const behaviorContext = adaptiveBehaviors && adaptiveBehaviors.length > 0
    ? `\n## Style:\n${adaptiveBehaviors.map((b: any) => `- ${b.description}`).join('\n')}\n`
    : '';

  const systemPrompt = `You are a helpful AI assistant${isAnonymous ? '' : ' with learning capabilities'}.${behaviorContext}${memoryContext}${webSearchContext}`;

  // Determine model to use
  const complexity = agentAnalysis?.complexity || "medium";
  const useClaude = complexity === "high" || forceAgent === "claude";
  const modelUsed = useClaude ? "claude-sonnet-4-5" : "google/gemini-2.5-flash";
  
  logger.info("Using model", { model: modelUsed, complexity });

  // Stream response
  let response: Response;
  
  if (useClaude) {
    const claudeResponse = await supabase.functions.invoke("claude-chat", {
      body: { 
        messages: [...messages],
        systemPrompt,
        maxTokens: 4096
      }
    });
    
    if (!claudeResponse.data) {
      throw new Error("Claude chat failed");
    }
    
    response = new Response(claudeResponse.data, {
      headers: { "Content-Type": "text/event-stream" }
    });
  } else {
    response = await lovableAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) throw response;
  }

  // Store interaction (skip for anonymous users)
  let interactionData = null;
  if (!isAnonymous) {
    const { data } = await supabase.from("interactions").insert({
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
    interactionData = data;
  }

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
                  completionTokens++;
                }
                if (json.usage) {
                  promptTokens = json.usage.prompt_tokens || 0;
                  completionTokens = json.usage.completion_tokens || 0;
                }
              } catch {}
            }
          }
        }

        // Update interaction with response (skip for anonymous users)
        if (!isAnonymous && interactionData?.id && assistantResponse) {
          await supabase.from("interactions")
            .update({ response: assistantResponse })
            .eq("id", interactionData.id);
        }

        // Track LLM observation (skip for anonymous users)
        if (!isAnonymous) {
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
          }).catch((err: any) => logger.error("Failed to track observation", err));
        }

        controller.close();
      } catch (error) {
        logger.error("Stream error", error);
        controller.error(error);
      }
    },
  });

  return streamResponse(stream, requestId);
}
