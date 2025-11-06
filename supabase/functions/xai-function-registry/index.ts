import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define available tools
const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_stock_price",
      description: "Get current stock price for a given symbol",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Stock ticker symbol (e.g., TSLA, AAPL)" },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_news",
      description: "Search recent news articles",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          days: { type: "number", description: "Number of days to look back", default: 7 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weather_forecast",
      description: "Get weather forecast for a location",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "City name or location" },
          days: { type: "number", description: "Number of days forecast", default: 5 },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Perform mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string", description: "Mathematical expression to evaluate" },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "translate",
      description: "Translate text to another language",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to translate" },
          target_lang: { type: "string", description: "Target language code (e.g., es, fr, de)" },
        },
        required: ["text", "target_lang"],
      },
    },
  },
];

// Function implementations
async function executeFunction(functionName: string, args: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    switch (functionName) {
      case "calculate":
        // Safe eval for basic math
        const result = eval(args.expression.replace(/[^0-9+\-*/().\s]/g, ""));
        return { result, execution_time_ms: Date.now() - startTime };
      
      case "translate":
        // Placeholder - would integrate with translation API
        return {
          translated_text: `[${args.target_lang}] ${args.text}`,
          source_lang: "en",
          target_lang: args.target_lang,
          execution_time_ms: Date.now() - startTime,
        };
      
      case "get_stock_price":
        // Placeholder - would integrate with finance API
        return {
          symbol: args.symbol,
          price: (Math.random() * 500 + 100).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          execution_time_ms: Date.now() - startTime,
        };
      
      case "search_news":
        // Placeholder - would integrate with news API
        return {
          articles: [
            {
              title: `Latest news about ${args.query}`,
              summary: `Recent developments in ${args.query}...`,
              source: "Example News",
              published_at: new Date().toISOString(),
            },
          ],
          execution_time_ms: Date.now() - startTime,
        };
      
      case "weather_forecast":
        // Placeholder - would integrate with weather API
        return {
          location: args.location,
          forecast: Array.from({ length: args.days || 5 }, (_, i) => ({
            day: new Date(Date.now() + i * 86400000).toLocaleDateString(),
            temp: Math.floor(Math.random() * 30 + 10),
            condition: ["Sunny", "Cloudy", "Rainy"][Math.floor(Math.random() * 3)],
          })),
          execution_time_ms: Date.now() - startTime,
        };
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    throw new Error(`Function execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

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

    const { action, functionName, arguments: funcArgs, sessionId } = await req.json();

    if (action === "list") {
      // Return available tools
      return new Response(
        JSON.stringify({
          success: true,
          tools: AVAILABLE_TOOLS,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "execute") {
      console.log(`Executing function: ${functionName} with args:`, funcArgs);

      const result = await executeFunction(functionName, funcArgs);

      // Log function call
      await supabase.from("xai_function_calls").insert({
        user_id: user.id,
        session_id: sessionId,
        function_name: functionName,
        arguments: funcArgs,
        result,
        success: true,
        execution_time_ms: result.execution_time_ms,
      });

      return new Response(
        JSON.stringify({
          success: true,
          function_name: functionName,
          result,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Function registry error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
