import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { optionalAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';
import { huggingFaceFetch } from '../_shared/api-client.ts';

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

  const requestId = crypto.randomUUID();
  const logger = createLogger('huggingface-inference', requestId);
  const startTime = Date.now();

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;
    
    logger.info('Processing HuggingFace request', { 
      userId: user?.id || 'anonymous',
      isAnonymous 
    });

    const body: HuggingFaceRequest = await req.json();
    const { modelId, task, inputs, parameters, options } = body;
    
    validateRequiredFields(body, ['modelId', 'task', 'inputs']);

    logger.info('Calling HuggingFace model', { modelId, task });

    // Fetch model info from database
    const { data: modelData } = await supabase
      .from('huggingface_models')
      .select('*')
      .eq('model_id', modelId)
      .eq('active', true)
      .single();

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
    } else {
      requestBody = {
        inputs,
        options: {
          use_cache: options?.use_cache ?? true,
          wait_for_model: options?.wait_for_model ?? true,
        },
      };
    }

    // Call HuggingFace API
    const hfResponse = await huggingFaceFetch(`/models/${modelId}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }, {
      timeout: 60000,
      maxRetries: 2
    });

    if (!hfResponse.ok) {
      if (hfResponse.status === 429) {
        throw new Error('HuggingFace rate limit exceeded. Please try again later.');
      }
      if (hfResponse.status === 503) {
        throw new Error('Model is loading. Please try again in a few seconds.');
      }
      throw hfResponse;
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

    // Log to llm_observations only for authenticated users
    if (!isAnonymous) {
      await supabase.from('llm_observations').insert({
        user_id: user!.id,
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
    }

    logger.info('Inference completed', { task, latencyMs });

    return successResponse({
      success: true,
      result,
      modelId,
      task,
      latency_ms: latencyMs,
      cost_credits: costCredits,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'huggingface-inference',
      error,
      requestId,
    });
  }
});