import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';
import { withErrorHandling, FunctionContext } from '../_shared/function-wrapper.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(withErrorHandling('get-admin-stats', async (req, context: FunctionContext) => {
  const { logger, requestId } = context;

  try {
    // Create service role client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has super_admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (roleError || !roleData) {
      logger.warn('Access denied - not super_admin', { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Access denied - super_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log admin action
    logger.info('Logging admin action', { userId: user.id });
    await supabase.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: 'view_admin_stats',
      details: { endpoint: '/get-admin-stats', request_id: requestId }
    });

    // Fetch stats using service role permissions with optimized query
    logger.debug('Fetching admin stats');
    const startTime = Date.now();
    
    const [
      usersResult,
      agentsResult,
      sessionsResult,
      announcementsResult,
      pendingAgentsResult,
      creditsResult
    ] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from('custom_agents').select('id', { count: 'exact', head: true }),
      supabase.from('sessions').select('id', { count: 'exact', head: true }),
      supabase.from('system_announcements').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('custom_agents').select('id', { count: 'exact', head: true }).eq('is_template', false).eq('visibility', 'public'),
      supabase.from('user_subscriptions').select('credits_total')
    ]);

    const fetchDuration = Date.now() - startTime;
    logger.debug('Stats fetched', { duration: `${fetchDuration}ms` });

    // Calculate total credits
    const totalCredits = creditsResult.data?.reduce((sum, sub) => sum + (sub.credits_total || 0), 0) || 0;

    const stats = {
      total_users: usersResult.data?.users?.length || 0,
      total_agents: agentsResult.count || 0,
      total_sessions: sessionsResult.count || 0,
      active_announcements: announcementsResult.count || 0,
      pending_agent_approvals: pendingAgentsResult.count || 0,
      total_credits_distributed: totalCredits
    };

    logger.info('Admin stats fetched successfully', stats);

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Error fetching admin stats', error);
    throw error; // Let the wrapper handle the error response
  }
}));
