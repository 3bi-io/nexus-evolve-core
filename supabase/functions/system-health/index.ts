/**
 * System Health Function
 * Checks the health of critical services and configurations
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('system-health', requestId);

  try {
    logger.info('Starting system health check');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Check required secrets
    const secrets = {
      OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
      LOVABLE_API_KEY: !!Deno.env.get('LOVABLE_API_KEY'),
      SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    };

    logger.info('Checked secrets configuration', secrets);

    // Validate OpenAI API key if present
    let openaiValid = false;
    if (secrets.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
        });
        openaiValid = openaiResponse.ok;
        logger.info('OpenAI API validation', { valid: openaiValid });
      } catch (error) {
        logger.error('OpenAI validation failed', error);
      }
    }

    // Check recent cron job executions
    const { data: recentJobs, error: jobsError } = await supabase
      .from('cron_job_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (jobsError) {
      logger.error('Error fetching cron logs', jobsError);
    }

    const jobStatus = {
      lastEvolution: recentJobs?.find(j => j.job_name === 'evolve-system'),
      lastDiscovery: recentJobs?.find(j => j.job_name === 'discover-capabilities'),
      recentFailures: recentJobs?.filter(j => j.status === 'failed').length || 0,
      consecutiveFailures: 0,
    };

    // Calculate consecutive failures
    if (recentJobs) {
      for (const job of recentJobs) {
        if (job.status === 'failed') {
          jobStatus.consecutiveFailures++;
        } else if (job.status === 'success') {
          break;
        }
      }
    }

    logger.info('Cron job status', jobStatus);

    // Check embedding generation progress
    const { count: totalMemories } = await supabase
      .from('agent_memory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: memoriesWithEmbeddings } = await supabase
      .from('agent_memory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('embedding', 'is', null);

    const embeddingProgress = {
      total: totalMemories || 0,
      generated: memoriesWithEmbeddings || 0,
      percentage: totalMemories ? Math.round(((memoriesWithEmbeddings || 0) / totalMemories) * 100) : 100,
    };

    logger.info('Embedding progress', embeddingProgress);

    // Overall health status
    const isHealthy = 
      secrets.OPENAI_API_KEY &&
      secrets.LOVABLE_API_KEY &&
      openaiValid &&
      jobStatus.consecutiveFailures < 3;

    logger.info('Health check complete', { healthy: isHealthy });

    return successResponse({
      status: isHealthy ? 'healthy' : 'degraded',
      secrets,
      openaiValid,
      cronJobs: jobStatus,
      embeddings: embeddingProgress,
      checks: {
        secretsConfigured: Object.values(secrets).every(v => v),
        openaiWorking: openaiValid,
        cronJobsRunning: jobStatus.consecutiveFailures < 3,
        embeddingsProgressing: embeddingProgress.percentage > 0,
      },
      timestamp: new Date().toISOString(),
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'system-health',
      error,
      requestId
    });
  }
});
