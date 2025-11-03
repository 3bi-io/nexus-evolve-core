import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, agentId, versionId, changeSummary } = await req.json();

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    switch (action) {
      case 'create': {
        // Get current version number
        const { data: versions } = await supabase
          .from('agent_versions')
          .select('version_number')
          .eq('agent_id', agentId)
          .order('version_number', { ascending: false })
          .limit(1);

        const nextVersion = (versions?.[0]?.version_number || 0) + 1;

        // Create snapshot
        const snapshot = {
          name: agent.name,
          description: agent.description,
          system_prompt: agent.system_prompt,
          model: agent.model,
          temperature: agent.temperature,
          tools: agent.tools,
          personality: agent.personality,
          knowledge_base_ids: agent.knowledge_base_ids
        };

        const { data: version, error: versionError } = await supabase
          .from('agent_versions')
          .insert({
            agent_id: agentId,
            version_number: nextVersion,
            snapshot,
            change_summary: changeSummary,
            created_by: user.id
          })
          .select()
          .single();

        if (versionError) throw versionError;

        // Update agent's current version
        await supabase
          .from('custom_agents')
          .update({ current_version: nextVersion })
          .eq('id', agentId);

        return new Response(JSON.stringify({ success: true, version }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list': {
        const { data: versions, error: versionsError } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('agent_id', agentId)
          .order('version_number', { ascending: false });

        if (versionsError) throw versionsError;

        return new Response(JSON.stringify({ success: true, versions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'compare': {
        const { versionId2 } = await req.json();
        
        const { data: version1, error: v1Error } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('id', versionId)
          .single();

        const { data: version2, error: v2Error } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('id', versionId2)
          .single();

        if (v1Error || v2Error) throw v1Error || v2Error;

        // Calculate differences
        const diff = {
          name: version1.snapshot.name !== version2.snapshot.name,
          description: version1.snapshot.description !== version2.snapshot.description,
          system_prompt: version1.snapshot.system_prompt !== version2.snapshot.system_prompt,
          model: version1.snapshot.model !== version2.snapshot.model,
          temperature: version1.snapshot.temperature !== version2.snapshot.temperature,
          tools: JSON.stringify(version1.snapshot.tools) !== JSON.stringify(version2.snapshot.tools),
          personality: JSON.stringify(version1.snapshot.personality) !== JSON.stringify(version2.snapshot.personality)
        };

        return new Response(JSON.stringify({ success: true, version1, version2, diff }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'rollback': {
        const { data: version, error: versionError } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('id', versionId)
          .single();

        if (versionError) throw versionError;

        // Restore snapshot
        const { error: updateError } = await supabase
          .from('custom_agents')
          .update({
            ...version.snapshot,
            current_version: version.version_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', agentId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, message: 'Agent rolled back successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in agent-version-control:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
