import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateEnum } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

// Define available tools
const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_stock_price',
      description: 'Get current stock price for a given symbol',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Stock ticker symbol (e.g., TSLA, AAPL)' },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_news',
      description: 'Search recent news articles',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          days: { type: 'number', description: 'Number of days to look back', default: 7 },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'weather_forecast',
      description: 'Get weather forecast for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name or location' },
          days: { type: 'number', description: 'Number of days forecast', default: 5 },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Mathematical expression to evaluate' },
        },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'translate',
      description: 'Translate text to another language',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to translate' },
          target_lang: { type: 'string', description: 'Target language code (e.g., es, fr, de)' },
        },
        required: ['text', 'target_lang'],
      },
    },
  },
];

// Function implementations
async function executeFunction(functionName: string, args: any, logger: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    switch (functionName) {
      case 'calculate':
        const result = eval(args.expression.replace(/[^0-9+\-*/().\s]/g, ''));
        return { result, execution_time_ms: Date.now() - startTime };
      
      case 'translate':
        return {
          translated_text: `[${args.target_lang}] ${args.text}`,
          source_lang: 'en',
          target_lang: args.target_lang,
          execution_time_ms: Date.now() - startTime,
        };
      
      case 'get_stock_price':
        return {
          symbol: args.symbol,
          price: (Math.random() * 500 + 100).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          execution_time_ms: Date.now() - startTime,
        };
      
      case 'search_news':
        return {
          articles: [
            {
              title: `Latest news about ${args.query}`,
              summary: `Recent developments in ${args.query}...`,
              source: 'Example News',
              published_at: new Date().toISOString(),
            },
          ],
          execution_time_ms: Date.now() - startTime,
        };
      
      case 'weather_forecast':
        return {
          location: args.location,
          forecast: Array.from({ length: args.days || 5 }, (_, i) => ({
            day: new Date(Date.now() + i * 86400000).toLocaleDateString(),
            temp: Math.floor(Math.random() * 30 + 10),
            condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
          })),
          execution_time_ms: Date.now() - startTime,
        };
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    logger.error('Function execution failed', { functionName, error });
    throw new Error(`Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('xai-function-registry', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body = await req.json();

    validateRequiredFields(body, ['action']);
    validateEnum(body.action, 'action', ['list', 'execute']);

    const { action, functionName, arguments: funcArgs, sessionId } = body;

    if (action === 'list') {
      logger.info('Listing available functions', { userId: user.id });
      return successResponse({ tools: AVAILABLE_TOOLS }, requestId);
    }

    if (action === 'execute') {
      validateRequiredFields(body, ['functionName', 'arguments']);
      validateString(functionName, 'functionName');

      logger.info('Executing function', { functionName, userId: user.id });

      const result = await executeFunction(functionName, funcArgs, logger);

      // Log function call
      await supabase.from('xai_function_calls').insert({
        user_id: user.id,
        session_id: sessionId,
        function_name: functionName,
        arguments: funcArgs,
        result,
        success: true,
        execution_time_ms: result.execution_time_ms,
      });

      logger.info('Function executed successfully', { 
        functionName, 
        executionTime: result.execution_time_ms 
      });

      return successResponse({
        function_name: functionName,
        result,
      }, requestId);
    }

    throw new Error('Invalid action');
  } catch (error) {
    logger.error('Function registry error', error);
    return handleError({ functionName: 'xai-function-registry', error, requestId });
  }
});
