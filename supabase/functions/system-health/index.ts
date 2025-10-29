import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    console.log('[system-health] Checking system health for user:', user.id);

    // Check required secrets
    const secrets = {
      OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
      LOVABLE_API_KEY: !!Deno.env.get('LOVABLE_API_KEY'),
      SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    };

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
      } catch (error) {
        console.error('[system-health] OpenAI validation failed:', error);
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
      console.error('[system-health] Error fetching cron logs:', jobsError);
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

    // Overall health status
    const isHealthy = 
      secrets.OPENAI_API_KEY &&
      secrets.LOVABLE_API_KEY &&
      openaiValid &&
      jobStatus.consecutiveFailures < 3;

    return new Response(
      JSON.stringify({
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
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[system-health] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
