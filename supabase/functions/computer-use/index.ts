import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateNumber } from '../_shared/validators.ts';
import { anthropicFetch } from '../_shared/api-client.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

interface ComputerUseRequest {
  task: string;
  context?: string;
  max_steps?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('computer-use', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body: ComputerUseRequest = await req.json();

    validateRequiredFields(body, ['task']);
    validateString(body.task, 'task');
    if (body.max_steps !== undefined) {
      validateNumber(body.max_steps, 'max_steps', { min: 1, max: 10 });
    }

    const { task, context, max_steps = 5 } = body;

    logger.info('Computer use task requested', { userId: user.id, task });

    const systemPrompt = `You are a computer use agent with access to tools for web browsing, screenshot analysis, and task automation.
Your goal is to complete the user's task efficiently and accurately.

${context ? `Additional context: ${context}` : ''}`;

    const startTime = Date.now();
    const response = await anthropicFetch('/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: task,
          },
        ],
        tools: [
          {
            type: 'computer_20241022',
            name: 'computer',
            display_width_px: 1920,
            display_height_px: 1080,
            display_number: 1,
          },
          {
            type: 'text_editor_20241022',
            name: 'str_replace_editor',
          },
          {
            type: 'bash_20241022',
            name: 'bash',
          },
        ],
      }),
    }, {
      timeout: 120000,
      maxRetries: 2,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const result = await response.json();
    const latencyMs = Date.now() - startTime;

    // Extract results
    const textContent = result.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');

    const toolUses = result.content.filter((c: any) => c.type === 'tool_use');

    // Log the computer use session
    await supabase.from('llm_observations').insert({
      user_id: user.id,
      model_name: 'claude-sonnet-4-5',
      task_type: 'computer_use',
      prompt_tokens: result.usage?.input_tokens || 0,
      completion_tokens: result.usage?.output_tokens || 0,
      total_tokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
      latency_ms: latencyMs,
      cost_credits: (((result.usage?.input_tokens || 0) * 3) + ((result.usage?.output_tokens || 0) * 15)) / 1000000,
      success: true,
      metadata: {
        tool_uses: toolUses.length,
        stop_reason: result.stop_reason,
      },
    });

    logger.info('Computer use completed', { toolUses: toolUses.length, latency: latencyMs });

    return successResponse({
      result: textContent,
      tool_uses: toolUses,
      stop_reason: result.stop_reason,
      usage: result.usage,
      latency_ms: latencyMs,
    }, requestId);
  } catch (error) {
    logger.error('Computer use failed', error);
    return handleError({ functionName: 'computer-use', error, requestId });
  }
});
