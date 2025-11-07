/**
 * Auto Prune Memories Function
 * Automatically prunes user memories based on configured preferences
 */

import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

interface PruneRequest {
  user_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('auto-prune-memories', requestId);

  try {
    logger.info('Starting memory pruning process');

    const supabase = initSupabaseClient();

    const MEM0_API_KEY = Deno.env.get('MEM0_API_KEY');
    if (!MEM0_API_KEY) throw new Error('MEM0_API_KEY not configured');

    const body: PruneRequest = await req.json().catch(() => ({}));
    const targetUserId = body.user_id;

    let totalPruned = 0;
    let totalStorageSaved = 0;

    // Get users to prune (either specific user or all with auto-pruning enabled)
    const { data: users, error: usersError } = targetUserId
      ? await supabase.from('user_memory_preferences').select('*').eq('user_id', targetUserId)
      : await supabase.from('user_memory_preferences').select('*').eq('auto_pruning_enabled', true);

    if (usersError) throw usersError;

    logger.info('Fetched users for pruning', { count: users?.length || 0 });

    for (const userPref of users || []) {
      const userId = userPref.user_id;
      const aggressiveness = userPref.pruning_aggressiveness;
      const minAgeDays = userPref.min_age_days;
      const relevanceThreshold = userPref.relevance_threshold;

      logger.info('Pruning memories for user', { userId, aggressiveness });

      // Adjust threshold based on aggressiveness
      let adjustedThreshold = relevanceThreshold;
      if (aggressiveness === 'conservative') adjustedThreshold *= 0.7;
      if (aggressiveness === 'aggressive') adjustedThreshold *= 1.3;

      // Get all memories for user from Mem0
      const memResponse = await fetch(`https://api.mem0.ai/v1/memories/?user_id=${userId}`, {
        headers: {
          Authorization: `Token ${MEM0_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!memResponse.ok) {
        logger.error('Failed to fetch memories from Mem0', { userId });
        continue;
      }

      const memories = await memResponse.json();

      // Get temporal scores for these memories
      const { data: scores } = await supabase
        .from('memory_temporal_scores')
        .select('*')
        .eq('user_id', userId);

      const prunedMemoryIds: string[] = [];
      let storageSaved = 0;

      for (const memory of memories.results || []) {
        const score = scores?.find(s => s.memory_id === memory.id);
        
        if (!score) continue;

        // Calculate age in days
        const ageInDays = (Date.now() - new Date(score.created_at).getTime()) / (1000 * 60 * 60 * 24);

        // Decide if memory should be pruned
        const shouldPrune = 
          ageInDays >= minAgeDays && 
          (score.calculated_relevance || 0) < adjustedThreshold;

        if (shouldPrune) {
          // Delete from Mem0
          const deleteResponse = await fetch(`https://api.mem0.ai/v1/memories/${memory.id}/`, {
            method: 'DELETE',
            headers: {
              Authorization: `Token ${MEM0_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (deleteResponse.ok) {
            prunedMemoryIds.push(memory.id);
            storageSaved += 1; // Estimate: 1KB per memory

            // Delete temporal score
            await supabase
              .from('memory_temporal_scores')
              .delete()
              .eq('user_id', userId)
              .eq('memory_id', memory.id);
          }
        }
      }

      // Log pruning operation
      if (prunedMemoryIds.length > 0) {
        await supabase.from('memory_pruning_logs').insert({
          user_id: userId,
          pruned_count: prunedMemoryIds.length,
          storage_saved_kb: storageSaved,
          threshold_used: adjustedThreshold,
          pruned_memory_ids: prunedMemoryIds,
        });

        totalPruned += prunedMemoryIds.length;
        totalStorageSaved += storageSaved;

        logger.info('Pruned memories for user', { userId, count: prunedMemoryIds.length });
      }
    }

    logger.info('Memory pruning complete', { totalPruned, totalStorageSaved });

    return successResponse({
      success: true,
      total_pruned: totalPruned,
      total_storage_saved_kb: totalStorageSaved,
      users_processed: users?.length || 0,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'auto-prune-memories',
      error,
      requestId
    });
  }
});
