/**
 * Agent Version Control Function
 * Manages agent versions, snapshots, comparisons, and rollbacks
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateEnum } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('agent-version-control', requestId);

  try {
    logger.info('Processing agent version control request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['action', 'agentId']);
    validateString(body.action, 'action');
    validateString(body.agentId, 'agentId');
    validateEnum(body.action, 'action', ['create', 'list', 'compare', 'rollback']);

    const { action, agentId, versionId, changeSummary } = body;

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

    logger.info('Processing action', { action, agentId });

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

        logger.info('Version created', { versionNumber: nextVersion });
        return successResponse({ success: true, version }, requestId);
      }

      case 'list': {
        const { data: versions, error: versionsError } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('agent_id', agentId)
          .order('version_number', { ascending: false });

        if (versionsError) throw versionsError;

        logger.info('Versions listed', { count: versions?.length || 0 });
        return successResponse({ success: true, versions }, requestId);
      }

      case 'compare': {
        validateRequiredFields(body, ['versionId', 'versionId2']);
        const { versionId2 } = body;
        
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

        logger.info('Versions compared', { versionId, versionId2 });
        return successResponse({ success: true, version1, version2, diff }, requestId);
      }

      case 'rollback': {
        validateRequiredFields(body, ['versionId']);
        
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

        logger.info('Agent rolled back', { versionNumber: version.version_number });
        return successResponse({ 
          success: true, 
          message: 'Agent rolled back successfully' 
        }, requestId);
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    return handleError({
      functionName: 'agent-version-control',
      error,
      requestId
    });
  }
});
