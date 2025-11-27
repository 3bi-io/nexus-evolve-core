/**
 * xAI Workflow Executor Function
 * Executes multi-step workflows combining various xAI capabilities
 */

import { corsHeaders } from '../_shared/cors.ts';
import { optionalAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateArray } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

interface WorkflowStep {
  type: 'vision' | 'image-gen' | 'reasoning' | 'code-analysis' | 'search';
  input: string | any;
  config?: any;
}

interface WorkflowRequest {
  workflowId: string;
  steps: WorkflowStep[];
  initialInput: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('xai-workflow-executor', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    logger.info('Processing xAI workflow execution request', {
      userId: user?.id || 'anonymous',
      isAnonymous
    });

    // Parse and validate request body
    const body = await req.json() as WorkflowRequest;
    validateRequiredFields(body, ['workflowId', 'steps', 'initialInput']);
    validateString(body.workflowId, 'workflowId');
    validateArray(body.steps, 'steps');

    const { workflowId, steps, initialInput } = body;

    logger.info('Executing workflow', { workflowId, stepsCount: steps.length });

    const results: any[] = [];
    let currentInput = initialInput;
    const startTime = Date.now();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      logger.info(`Executing step ${i + 1}/${steps.length}`, { type: step.type });

      try {
        const stepStartTime = Date.now();
        let stepResult: any;

        switch (step.type) {
          case 'vision':
            stepResult = await executeVisionStep(supabase, currentInput, step.config);
            break;
          case 'image-gen':
            stepResult = await executeImageGenStep(supabase, currentInput, step.config);
            break;
          case 'reasoning':
            stepResult = await executeReasoningStep(supabase, currentInput, step.config);
            break;
          case 'code-analysis':
            stepResult = await executeCodeAnalysisStep(supabase, currentInput, step.config);
            break;
          case 'search':
            stepResult = await executeSearchStep(supabase, currentInput, step.config);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        const stepTime = Date.now() - stepStartTime;
        results.push({
          step: i + 1,
          type: step.type,
          result: stepResult,
          executionTime: stepTime,
          success: true,
        });

        // Use the result as input for the next step
        currentInput = stepResult.output || stepResult.result || stepResult;

      } catch (error) {
        logger.error(`Step ${i + 1} failed`, error);
        results.push({
          step: i + 1,
          type: step.type,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        });
        break; // Stop workflow on error
      }
    }

    const totalTime = Date.now() - startTime;

    // Log workflow execution only for authenticated users
    if (!isAnonymous) {
      await supabase.from('xai_usage_analytics').insert({
        user_id: user.id,
        model_id: 'workflow-executor',
        feature_type: 'workflow',
        latency_ms: totalTime,
        success: results.every(r => r.success),
        metadata: {
          workflow_id: workflowId,
          steps: steps.length,
          completed_steps: results.filter(r => r.success).length,
        },
      });
    }

    logger.info('Workflow execution complete', { 
      totalTime, 
      stepsCompleted: results.filter(r => r.success).length 
    });

    return successResponse({
      success: results.every(r => r.success),
      workflowId,
      results,
      totalExecutionTime: totalTime,
      stepsCompleted: results.filter(r => r.success).length,
      stepsTotal: steps.length,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'xai-workflow-executor',
      error,
      requestId
    });
  }
});

// Helper functions for executing different step types
async function executeVisionStep(supabase: any, input: any, config: any) {
  const { data, error } = await supabase.functions.invoke('xai-vision-analyzer', {
    body: {
      imageUrl: input.imageUrl || input,
      query: config?.query || 'Describe this image in detail',
      model: config?.model,
    },
  });

  if (error) throw error;
  return { output: data.analysis, raw: data };
}

async function executeImageGenStep(supabase: any, input: any, config: any) {
  const prompt = typeof input === 'string' ? input : input.prompt || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke('xai-image-generator', {
    body: {
      prompt,
      negativePrompt: config?.negativePrompt,
      numImages: config?.numImages || 1,
    },
  });

  if (error) throw error;
  return { output: data.images[0], images: data.images, raw: data };
}

async function executeReasoningStep(supabase: any, input: any, config: any) {
  const content = typeof input === 'string' ? input : JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
    body: {
      action: 'reasoning',
      content,
      context: config?.context,
      model: config?.model || 'grok-4',
      searchMode: config?.searchMode || 'on',
      returnCitations: true,
    },
  });

  if (error) throw error;
  return { output: data.reasoning, raw: data };
}

async function executeCodeAnalysisStep(supabase: any, input: any, config: any) {
  const code = typeof input === 'string' ? input : input.code || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke('xai-code-analyzer', {
    body: {
      code,
      language: config?.language || 'auto',
      analysisType: config?.analysisType || 'review',
    },
  });

  if (error) throw error;
  return { output: data.analysis, raw: data };
}

async function executeSearchStep(supabase: any, input: any, config: any) {
  const query = typeof input === 'string' ? input : input.query || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
    body: {
      action: 'search',
      topic: query,
      model: config?.model || 'grok-3',
      searchMode: 'on',
      returnCitations: true,
    },
  });

  if (error) throw error;
  return { output: data.answer, raw: data };
}
