import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { anthropicFetch } from '../_shared/api-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RouterRequest {
  message: string;
  context?: any;
  manualModel?: string; // User override
  ensembleMode?: boolean;
  sessionId?: string;
}

interface ModelSelection {
  selectedModel: string;
  modelId: string;
  provider: string;
  ensembleModels?: string[];
  reasoning: string;
  taskType: string;
  complexity: number;
  confidence: number;
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

    const body: RouterRequest = await req.json();
    const { message, context, manualModel, ensembleMode, sessionId } = body;

    console.log('Meta Router request:', { message: message.substring(0, 100), manualModel, ensembleMode });

    let modelSelection: ModelSelection;

    if (manualModel) {
      // User manually selected a model
      const { data: modelConfig } = await supabase
        .from('available_models')
        .select('*')
        .eq('model_name', manualModel)
        .single();

      if (!modelConfig) {
        throw new Error(`Model ${manualModel} not found`);
      }

      modelSelection = {
        selectedModel: manualModel,
        modelId: modelConfig.model_id,
        provider: modelConfig.provider,
        reasoning: 'User manual selection',
        taskType: 'general',
        complexity: 0.5,
        confidence: 1.0,
      };
    } else {
      // Intelligent routing
      modelSelection = await selectOptimalModel(
        supabase,
        user.id,
        message,
        context,
        ensembleMode || false
      );
    }

    // Log routing decision
    await supabase.from('model_routing_log').insert({
      user_id: user.id,
      task_type: modelSelection.taskType,
      task_complexity: modelSelection.complexity,
      selected_model: modelSelection.selectedModel,
      ensemble_mode: ensembleMode || false,
      ensemble_models: modelSelection.ensembleModels,
      routing_reason: modelSelection.reasoning,
      confidence_score: modelSelection.confidence,
    });

    // Execute the selected model
    const response = await executeModel(modelSelection, message, context);

    const latency = Date.now() - startTime;

    // Update performance tracking
    await supabase.rpc('update_model_performance', {
      p_user_id: user.id,
      p_model_name: modelSelection.selectedModel,
      p_task_type: modelSelection.taskType,
      p_success: true,
      p_latency_ms: latency,
      p_cost_credits: estimateCost(modelSelection.selectedModel, response.length),
    });

    return new Response(
      JSON.stringify({
        response: response,
        modelUsed: modelSelection.selectedModel,
        reasoning: modelSelection.reasoning,
        latency,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Meta Router error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function selectOptimalModel(
  supabase: any,
  userId: string,
  message: string,
  context: any,
  ensembleMode: boolean
): Promise<ModelSelection> {
  // Analyze the task
  const taskAnalysis = analyzeTask(message, context);

  // Get user's model performance history
  const { data: performance } = await supabase
    .from('model_performance')
    .select('*')
    .eq('user_id', userId)
    .eq('task_type', taskAnalysis.taskType)
    .order('success_rate', { ascending: false })
    .limit(5);

  // Get available models that match required capabilities
  const { data: availableModels } = await supabase
    .from('available_models')
    .select('*')
    .eq('is_available', true)
    .order('priority', { ascending: false });

  if (!availableModels || availableModels.length === 0) {
    throw new Error('No models available');
  }

  // Score each model
  const scoredModels = availableModels.map((model: any) => {
    let score = model.priority;

    // Bonus for matching capabilities
    const capabilityMatch = taskAnalysis.requiredCapabilities.filter(
      (cap: string) => model.capabilities.includes(cap)
    ).length;
    score += capabilityMatch * 10;

    // Bonus for user's historical success with this model
    const userPerf = performance?.find((p: any) => p.model_name === model.model_name);
    if (userPerf) {
      score += userPerf.success_rate * 20;
      score -= (userPerf.avg_latency_ms / 1000) * 2; // Penalize slow models
    }

    // Adjust for complexity
    if (taskAnalysis.complexity > 0.7 && model.model_name.includes('Opus')) {
      score += 15; // Prefer Opus for complex tasks
    } else if (taskAnalysis.complexity < 0.3 && model.model_name.includes('Nano')) {
      score += 15; // Prefer Nano for simple tasks
    }

    // Real-time tasks prefer Grok
    if (taskAnalysis.requiresRealTime && model.model_name.includes('Grok')) {
      score += 20;
    }

    return { ...model, score };
  });

  scoredModels.sort((a: any, b: any) => b.score - a.score);

  const selectedModel = scoredModels[0];

  let ensembleModels: string[] | undefined;
  if (ensembleMode && taskAnalysis.complexity > 0.7) {
    // Use top 3 models for ensemble on complex tasks
    ensembleModels = scoredModels.slice(0, 3).map((m: any) => m.model_name);
  }

  return {
    selectedModel: selectedModel.model_name,
    modelId: selectedModel.model_id,
    provider: selectedModel.provider,
    ensembleModels,
    reasoning: `Selected ${selectedModel.model_name} (score: ${selectedModel.score.toFixed(1)}) for ${taskAnalysis.taskType} task with ${(taskAnalysis.complexity * 100).toFixed(0)}% complexity`,
    taskType: taskAnalysis.taskType,
    complexity: taskAnalysis.complexity,
    confidence: Math.min(selectedModel.score / 100, 1.0),
  };
}

function analyzeTask(message: string, context: any): {
  taskType: string;
  complexity: number;
  requiredCapabilities: string[];
  requiresRealTime: boolean;
} {
  const lowerMessage = message.toLowerCase();
  let taskType = 'general';
  let complexity = 0.5;
  const requiredCapabilities: string[] = ['general'];
  let requiresRealTime = false;

  // Detect task type
  if (
    lowerMessage.includes('analyze') ||
    lowerMessage.includes('compare') ||
    lowerMessage.includes('evaluate') ||
    lowerMessage.includes('reason')
  ) {
    taskType = 'reasoning';
    complexity = 0.7;
    requiredCapabilities.push('reasoning');
  } else if (
    lowerMessage.includes('create') ||
    lowerMessage.includes('write') ||
    lowerMessage.includes('generate') ||
    lowerMessage.includes('design')
  ) {
    taskType = 'creative';
    complexity = 0.6;
    requiredCapabilities.push('creative');
  } else if (
    lowerMessage.includes('image') ||
    lowerMessage.includes('picture') ||
    lowerMessage.includes('photo') ||
    lowerMessage.includes('visual')
  ) {
    taskType = 'vision';
    complexity = 0.6;
    requiredCapabilities.push('vision');
  } else if (
    lowerMessage.includes('trend') ||
    lowerMessage.includes('current') ||
    lowerMessage.includes('latest') ||
    lowerMessage.includes('now') ||
    lowerMessage.includes('today')
  ) {
    taskType = 'real-time';
    complexity = 0.5;
    requiredCapabilities.push('real-time');
    requiresRealTime = true;
  }

  // Adjust complexity based on message length and context
  if (message.length > 500) complexity += 0.1;
  if (context?.sessionMessages && context.sessionMessages.length > 5) complexity += 0.1;
  if (lowerMessage.includes('step by step') || lowerMessage.includes('detailed')) complexity += 0.15;

  complexity = Math.min(complexity, 1.0);

  return { taskType, complexity, requiredCapabilities, requiresRealTime };
}

async function executeModel(
  selection: ModelSelection,
  message: string,
  context: any
): Promise<string> {
  const { provider, modelId } = selection;

  // Route to appropriate API
  if (provider === 'lovable') {
    return executeLovableAI(modelId, message, context);
  } else if (provider === 'openai') {
    return executeOpenAI(modelId, message, context);
  } else if (provider === 'anthropic') {
    return executeAnthropic(modelId, message, context);
  } else if (provider === 'xai') {
    return executeGrok(modelId, message, context);
  }

  throw new Error(`Provider ${provider} not implemented`);
}

async function executeLovableAI(modelId: string, message: string, context: any): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: message }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function executeOpenAI(modelId: string, message: string, context: any): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: message }
      ],
      max_completion_tokens: 4096,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function executeAnthropic(modelId: string, message: string, context: any): Promise<string> {
  const response = await anthropicFetch('/v1/messages', {
    method: 'POST',
    body: JSON.stringify({
      model: modelId,
      system: 'You are a helpful AI assistant that provides clear and accurate responses.',
      messages: [{ role: 'user', content: message }],
      max_tokens: 4096,
    }),
  }, {
    timeout: 60000,
    maxRetries: 2
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Anthropic API error: ${response.status} - ${errorText}`);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data?.content?.[0]?.text) {
    throw new Error('Invalid response structure from Anthropic API');
  }
  
  return data.content[0].text;
}

async function executeGrok(modelId: string, message: string, context: any): Promise<string> {
  const apiKey = Deno.env.get('GROK_API_KEY');
  if (!apiKey) throw new Error('GROK_API_KEY not configured');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: 'You are Grok, a helpful AI assistant with real-time knowledge.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function estimateCost(modelName: string, responseLength: number): number {
  // Simple cost estimation based on model
  const baseCosts: Record<string, number> = {
    'GPT-5': 5,
    'GPT-5 Mini': 2,
    'GPT-5 Nano': 1,
    'Claude Opus 4.1': 8,
    'Claude Sonnet 4.5': 4,
    'Grok 3': 3,
    'Gemini Pro 2.5': 3,
    'Gemini Flash 2.5': 1,
  };

  return baseCosts[modelName] || 2;
}
