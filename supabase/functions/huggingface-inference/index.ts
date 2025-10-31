import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type HuggingFaceRequest = {
  modelId: string;
  task: 'text-generation' | 'text-to-image' | 'feature-extraction' | 'image-classification';
  inputs: string | object;
  parameters?: Record<string, any>;
  options?: {
    use_cache?: boolean;
    wait_for_model?: boolean;
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { modelId, task, inputs, parameters, options }: HuggingFaceRequest = await req.json();
    
    if (!modelId || !task || !inputs) {
      throw new Error('Missing required fields: modelId, task, or inputs');
    }

    const hfApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!hfApiKey) {
      throw new Error('HUGGINGFACE_API_KEY not configured');
    }

    console.log(`[huggingface-inference] Processing ${task} request for model ${modelId}`);

    // Fetch model info from database
    const { data: modelData } = await supabase
      .from('huggingface_models')
      .select('*')
      .eq('model_id', modelId)
      .eq('active', true)
      .single();

    // Construct HuggingFace API endpoint
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;

    // Prepare request body based on task type
    let requestBody: any = {};
    
    if (task === 'text-generation') {
      requestBody = {
        inputs,
        parameters: {
          max_new_tokens: parameters?.max_tokens || 512,
          temperature: parameters?.temperature || 0.7,
          top_p: parameters?.top_p || 0.9,
          return_full_text: false,
          ...parameters,
        },
        options: {
          use_cache: options?.use_cache ?? true,
          wait_for_model: options?.wait_for_model ?? true,
        },
      };
    } else if (task === 'text-to-image') {
      requestBody = {
        inputs,
        parameters: {
          num_inference_steps: parameters?.num_inference_steps || 50,
          guidance_scale: parameters?.guidance_scale || 7.5,
          ...parameters,
        },
        options: {
          use_cache: options?.use_cache ?? false,
          wait_for_model: options?.wait_for_model ?? true,
        },
      };
    } else if (task === 'feature-extraction') {
      requestBody = {
        inputs,
        options: {
          use_cache: options?.use_cache ?? true,
          wait_for_model: options?.wait_for_model ?? true,
        },
      };
    } else if (task === 'image-classification') {
      requestBody = {
        inputs,
        options: {
          use_cache: options?.use_cache ?? true,
          wait_for_model: options?.wait_for_model ?? true,
        },
      };
    }

    // Call HuggingFace API
    const hfResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('[huggingface-inference] API Error:', hfResponse.status, errorText);
      
      // Handle rate limiting
      if (hfResponse.status === 429) {
        throw new Error('HuggingFace rate limit exceeded. Please try again later.');
      }
      
      // Handle model loading
      if (hfResponse.status === 503) {
        throw new Error('Model is loading. Please try again in a few seconds.');
      }
      
      throw new Error(`HuggingFace API error: ${hfResponse.status} - ${errorText}`);
    }

    const latencyMs = Date.now() - startTime;
    let result: any;

    // Parse response based on task type
    if (task === 'text-to-image') {
      const blob = await hfResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      result = {
        image: `data:image/png;base64,${base64}`,
        modelId,
        task,
      };
    } else {
      result = await hfResponse.json();
    }

    // Calculate cost estimate
    const costCredits = modelData?.cost_per_1k_tokens 
      ? (typeof inputs === 'string' ? inputs.length / 4000 : 1) * (modelData.cost_per_1k_tokens * 1000)
      : 0.001;

    // Log to llm_observations
    await supabase.from('llm_observations').insert({
      user_id: user.id,
      agent_type: 'huggingface',
      model_used: modelId,
      prompt_tokens: typeof inputs === 'string' ? Math.ceil(inputs.length / 4) : 0,
      completion_tokens: task === 'text-generation' && result[0]?.generated_text 
        ? Math.ceil(result[0].generated_text.length / 4) 
        : 0,
      latency_ms: latencyMs,
      total_cost: costCredits,
      provider: 'huggingface',
      metadata: {
        task,
        model_info: modelData,
        parameters,
      },
    });

    console.log(`[huggingface-inference] Success - ${task} completed in ${latencyMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        result,
        modelId,
        task,
        latency_ms: latencyMs,
        cost_credits: costCredits,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[huggingface-inference] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
