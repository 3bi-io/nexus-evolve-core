import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('content-generation-worker', requestId);

  try {
    const supabase = initSupabaseClient();

    // Fetch pending content generation tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('content_generation_queue')
      .select('*')
      .eq('status', 'pending')
      .or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      logger.info('No pending tasks found');
      return successResponse({ message: 'No pending tasks', processed: 0 }, requestId);
    }

    logger.info('Processing content generation tasks', { count: tasks.length });

    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        try {
          // Mark as processing
          await supabase
            .from('content_generation_queue')
            .update({
              status: 'processing',
              started_at: new Date().toISOString(),
            })
            .eq('id', task.id);

          let result: any = {};

          // Generate content based on type
          switch (task.content_type) {
            case 'social_post':
              const { data: postData } = await supabase.functions.invoke('grok-reality-agent', {
                body: {
                  query: task.prompt,
                  mode: 'creative',
                  parameters: task.parameters,
                  userId: task.user_id,
                },
              });
              result = { content: postData?.response, metadata: postData?.metadata };
              break;

            case 'image':
              const { data: imageData } = await supabase.functions.invoke('xai-image-generator', {
                body: {
                  prompt: task.prompt,
                  ...task.parameters,
                  userId: task.user_id,
                },
              });
              result = { imageUrl: imageData?.imageUrl, metadata: imageData };
              break;

            case 'blog':
              const { data: blogData } = await supabase.functions.invoke('grok-reality-agent', {
                body: {
                  query: `Write a comprehensive blog post: ${task.prompt}`,
                  mode: 'reasoning',
                  parameters: task.parameters,
                  userId: task.user_id,
                },
              });
              result = { content: blogData?.response, metadata: blogData?.metadata };
              break;

            case 'video_script':
              const { data: scriptData } = await supabase.functions.invoke('grok-reality-agent', {
                body: {
                  query: `Create a video script: ${task.prompt}`,
                  mode: 'creative',
                  parameters: task.parameters,
                  userId: task.user_id,
                },
              });
              result = { script: scriptData?.response, metadata: scriptData?.metadata };
              break;

            default:
              throw new Error(`Unknown content type: ${task.content_type}`);
          }

          // Mark as completed
          await supabase
            .from('content_generation_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              result,
            })
            .eq('id', task.id);

          logger.info('Task completed', { taskId: task.id, type: task.content_type });
          return { taskId: task.id, success: true };
        } catch (taskError) {
          logger.error('Task failed', { taskId: task.id, error: taskError });

          // Update retry count
          const newRetryCount = task.retry_count + 1;
          const shouldRetry = newRetryCount < 3;

          await supabase
            .from('content_generation_queue')
            .update({
              status: shouldRetry ? 'pending' : 'failed',
              error_message: taskError instanceof Error ? taskError.message : 'Unknown error',
              retry_count: newRetryCount,
            })
            .eq('id', task.id);

          return { taskId: task.id, success: false, error: taskError };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    logger.info('Worker completed', { processed: tasks.length, successful, failed });

    return successResponse({
      processed: tasks.length,
      successful,
      failed,
    }, requestId);
  } catch (error) {
    logger.error('Worker failed', error);
    return handleError({ functionName: 'content-generation-worker', error, requestId });
  }
});
