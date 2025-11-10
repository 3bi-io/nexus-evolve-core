import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
      console.log('Access denied - not super_admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Access denied - super_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: 'view_admin_stats',
      details: { endpoint: '/get-admin-stats' }
    });

    // Fetch stats using service role permissions
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

    console.log('Admin stats fetched successfully:', stats);

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-admin-stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
