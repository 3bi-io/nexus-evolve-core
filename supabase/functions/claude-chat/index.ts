import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { anthropicFetch } from "../_shared/api-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { messages, systemPrompt, maxTokens = 4096 } = await req.json();
    
    console.log(`[Claude] Processing ${messages.length} messages`);
    
    const response = await anthropicFetch("/v1/messages", {
      method: "POST",
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: maxTokens,
        system: systemPrompt || "You are a helpful AI assistant.",
        messages: messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        })),
        stream: true
      }),
    }, {
      timeout: 60000, // 60s for streaming
      maxRetries: 2,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Claude] API error: ${response.status} - ${errorText}`);
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    // Convert Claude streaming format to OpenAI format for compatibility
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    // Convert to OpenAI format
                    const openAIFormat = `data: ${JSON.stringify({
                      choices: [{
                        delta: {
                          content: parsed.delta.text
                        }
                      }]
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(openAIFormat));
                  }
                } catch (parseError) {
                  console.error('[Claude] Parse error:', parseError);
                }
              }
            }
          }
          
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[Claude] Stream error:', error);
          controller.error(error);
        }
      }
    });
    
    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("[Claude] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
