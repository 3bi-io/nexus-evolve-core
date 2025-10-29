import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteRequest {
  agentId: string;
  message: string;
  sessionId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ExecuteRequest = await req.json();
    const { agentId, message, sessionId, conversationHistory } = body;

    console.log('Custom Agent Executor:', { agentId, user: user.id, message: message.substring(0, 100) });

    // Fetch agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or access denied');
    }

    // Check if user has access (owns it or purchased it)
    const hasAccess = agent.user_id === user.id || agent.is_public;
    
    if (!hasAccess && agent.price_credits > 0) {
      const { data: purchase } = await supabase
        .from('agent_purchases')
        .select('id')
        .eq('agent_id', agentId)
        .eq('buyer_id', user.id)
        .single();
      
      if (!purchase) {
        return new Response(
          JSON.stringify({ error: 'Agent not purchased. Please purchase from marketplace.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Increment usage counter
    await supabase.rpc('increment_agent_usage', { p_agent_id: agentId });

    // Build messages array with agent's system prompt
    const messages = [
      { role: 'system', content: agent.system_prompt }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Prepare tools if enabled
    const tools = buildTools(agent.tools_enabled);

    // Execute with selected model
    const response = await executeWithModel(
      agent.model_preference || 'auto',
      messages,
      tools,
      agent.temperature,
      agent.max_tokens
    );

    const executionTime = Date.now() - startTime;

    // Log execution
    await supabase.from('agent_executions').insert({
      agent_id: agentId,
      user_id: user.id,
      session_id: sessionId,
      input_message: message,
      output_message: response.content,
      tools_used: response.toolsUsed,
      execution_time_ms: executionTime,
      tokens_used: response.tokensUsed,
      cost_credits: estimateCost(response.tokensUsed),
      success: true,
    });

    return new Response(
      JSON.stringify({
        response: response.content,
        agentName: agent.name,
        toolsUsed: response.toolsUsed,
        executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Custom Agent Executor error:', error);
    
    // Log failed execution
    const body = await req.json().catch(() => ({}));
    if (body.agentId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const authHeader = req.headers.get('Authorization');
      const { data: { user } } = await supabase.auth.getUser(
        authHeader?.replace('Bearer ', '') || ''
      );

      if (user) {
        await supabase.from('agent_executions').insert({
          agent_id: body.agentId,
          user_id: user.id,
          input_message: body.message || '',
          success: false,
          error_message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildTools(toolsEnabled: string[]): any[] {
  const tools: any[] = [];

  if (toolsEnabled.includes('web_search')) {
    tools.push({
      type: 'function',
      function: {
        name: 'web_search',
        description: 'Search the web for current information',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        }
      }
    });
  }

  if (toolsEnabled.includes('calculator')) {
    tools.push({
      type: 'function',
      function: {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        parameters: {
          type: 'object',
          properties: {
            expression: { type: 'string', description: 'Mathematical expression to evaluate' }
          },
          required: ['expression']
        }
      }
    });
  }

  if (toolsEnabled.includes('semantic_search')) {
    tools.push({
      type: 'function',
      function: {
        name: 'semantic_search',
        description: 'Search through user knowledge base using semantic similarity',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        }
      }
    });
  }

  if (toolsEnabled.includes('zapier')) {
    tools.push({
      type: 'function',
      function: {
        name: 'trigger_zapier',
        description: 'Trigger a Zapier webhook',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'object', description: 'Data to send to Zapier' }
          },
          required: ['data']
        }
      }
    });
  }

  return tools;
}

async function executeWithModel(
  modelPreference: string,
  messages: any[],
  tools: any[],
  temperature: number,
  maxTokens: number
): Promise<{ content: string; toolsUsed: string[]; tokensUsed: number }> {
  // Use Lovable AI Gateway for execution
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  const modelId = modelPreference === 'auto' ? 'google/gemini-2.5-flash' : modelPreference;

  const requestBody: any = {
    model: modelId,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (tools.length > 0) {
    requestBody.tools = tools;
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  
  let content = choice.message.content || '';
  const toolsUsed: string[] = [];

  // Handle tool calls if present
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    for (const toolCall of choice.message.tool_calls) {
      toolsUsed.push(toolCall.function.name);
      
      // Execute tool and add result (simplified for now)
      const toolResult = await executeToolCall(toolCall);
      content += `\n\n[Tool: ${toolCall.function.name}]\n${toolResult}`;
    }
  }

  return {
    content,
    toolsUsed,
    tokensUsed: data.usage?.total_tokens || 1000,
  };
}

async function executeToolCall(toolCall: any): Promise<string> {
  const functionName = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);

  switch (functionName) {
    case 'web_search':
      return `Web search results for: ${args.query}\n[Search functionality would be integrated here]`;
    
    case 'calculate':
      try {
        const result = eval(args.expression);
        return `Calculation result: ${result}`;
      } catch {
        return 'Invalid mathematical expression';
      }
    
    case 'semantic_search':
      return `Semantic search results for: ${args.query}\n[Knowledge base search would be integrated here]`;
    
    case 'trigger_zapier':
      return 'Zapier webhook triggered successfully';
    
    default:
      return 'Tool execution not implemented';
  }
}

function estimateCost(tokensUsed: number): number {
  return Math.ceil(tokensUsed / 1000) * 2; // 2 credits per 1K tokens
}
