/**
 * Evolve System Function
 * Runs daily evolution cycle: performance analysis, knowledge consolidation, 
 * behavior optimization, A/B test evaluation, and capability auto-activation
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
  const logger = createLogger('evolve-system', requestId);

  try {
    logger.info('Starting daily evolution cycle');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // 1. PERFORMANCE ANALYSIS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentInteractions } = await supabase
      .from('interactions')
      .select('quality_rating, created_at, context')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    const ratedInteractions = recentInteractions?.filter(i => i.quality_rating !== null) || [];
    const avgRating = ratedInteractions.length > 0
      ? ratedInteractions.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / ratedInteractions.length
      : 0;

    // Calculate trend (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentWeek = ratedInteractions.filter(i => new Date(i.created_at) >= sevenDaysAgo);
    const previousWeek = ratedInteractions.filter(i => {
      const date = new Date(i.created_at);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });

    const recentAvg = recentWeek.length > 0
      ? recentWeek.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / recentWeek.length
      : 0;
    const previousAvg = previousWeek.length > 0
      ? previousWeek.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / previousWeek.length
      : 0;

    const trend = recentAvg > previousAvg ? 'improving' : 
                  recentAvg < previousAvg ? 'declining' : 'stable';

    logger.info('Performance analysis complete', { avgRating, trend });

    // 2. KNOWLEDGE CONSOLIDATION
    const { data: memories } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('retrieval_count', { ascending: true });

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const memoriesToArchive = memories?.filter(m => 
      m.retrieval_count === 0 && new Date(m.created_at) < sixtyDaysAgo
    ) || [];

    let archivedCount = 0;
    if (memoriesToArchive.length > 0) {
      const { error } = await supabase
        .from('agent_memory')
        .delete()
        .in('id', memoriesToArchive.map(m => m.id));
      
      if (!error) {
        archivedCount = memoriesToArchive.length;
      }
    }

    const frequentMemories = memories?.filter(m => m.retrieval_count > 5) || [];
    for (const memory of frequentMemories) {
      const newImportance = Math.min(1.0, memory.importance_score + 0.05);
      await supabase
        .from('agent_memory')
        .update({ importance_score: newImportance })
        .eq('id', memory.id);
    }

    const unusedMemories = memories?.filter(m => {
      const lastRetrieved = m.last_retrieved_at ? new Date(m.last_retrieved_at) : new Date(m.created_at);
      return lastRetrieved < thirtyDaysAgo && m.importance_score > 0.2;
    }) || [];
    
    let decayedCount = 0;
    for (const memory of unusedMemories) {
      const newImportance = Math.max(0.2, memory.importance_score - 0.02);
      await supabase
        .from('agent_memory')
        .update({ importance_score: newImportance })
        .eq('id', memory.id);
      decayedCount++;
    }

    logger.info('Knowledge consolidation complete', { archivedCount, boosted: frequentMemories.length, decayedCount });

    // 3. ADAPTIVE BEHAVIOR OPTIMIZATION
    const { data: behaviors } = await supabase
      .from('adaptive_behaviors')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true);

    const behaviorUpdates = [];
    for (const behavior of behaviors || []) {
      if (behavior.effectiveness_score < 0.3 && behavior.application_count > 10) {
        await supabase
          .from('adaptive_behaviors')
          .update({ active: false })
          .eq('id', behavior.id);
        behaviorUpdates.push({ id: behavior.id, action: 'deactivated' });
      }
    }

    logger.info('Behavior optimization complete', { deactivated: behaviorUpdates.length });

    // 4. A/B TEST EVALUATION
    const { data: activeExperiments } = await supabase
      .from('ab_experiments')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true);

    let experimentResults = [];
    for (const experiment of activeExperiments || []) {
      const startDate = new Date(experiment.started_at);
      const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceStart >= 7) {
        const metrics = experiment.metrics || {};
        const winner = metrics.test_score > metrics.control_score ? 'test' : 'control';
        
        await supabase
          .from('ab_experiments')
          .update({
            active: false,
            ended_at: new Date().toISOString(),
            winner
          })
          .eq('id', experiment.id);

        experimentResults.push({
          experiment: experiment.experiment_name,
          winner,
          duration_days: Math.floor(daysSinceStart)
        });
      }
    }

    logger.info('A/B test evaluation complete', { completed: experimentResults.length });

    // 5. CAPABILITY AUTO-ACTIVATION
    const { data: pendingSuggestions } = await supabase
      .from('capability_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('confidence_score', 0.8);

    let autoApproved = 0;
    for (const suggestion of pendingSuggestions || []) {
      await supabase
        .from('capability_suggestions')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', suggestion.id);

      await supabase
        .from('capability_modules')
        .insert({
          user_id: user.id,
          capability_name: suggestion.capability_name,
          description: suggestion.description,
          is_enabled: true
        });

      autoApproved++;
    }

    logger.info('Capability auto-activation complete', { autoApproved });

    const learningEfficiency = avgRating > 0 ? 'good' : 'needs_improvement';
    
    // Log comprehensive evolution report
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'system_evolution',
      description: `Daily evolution cycle: ${trend} performance, ${archivedCount} memories archived, ${behaviorUpdates.length} behaviors optimized`,
      change_type: 'auto_discovery',
      metrics: {
        performance: {
          avg_rating: avgRating,
          trend,
          recent_week_avg: recentAvg,
          previous_week_avg: previousAvg,
          interactions_count: recentInteractions?.length || 0
        },
        knowledge_consolidation: {
          memories_archived: archivedCount,
          memories_boosted: frequentMemories.length,
          memories_decayed: decayedCount,
          total_memories: memories?.length || 0
        },
        behavior_optimization: {
          behaviors_updated: behaviorUpdates.length,
          active_behaviors: behaviors?.length || 0
        },
        experiments: {
          completed: experimentResults.length,
          results: experimentResults
        },
        capabilities: {
          auto_approved: autoApproved,
          pending_count: (pendingSuggestions?.length || 0) - autoApproved
        },
        meta_learning: {
          learning_efficiency: learningEfficiency
        }
      },
      success: true
    });

    logger.info('Evolution cycle complete');

    return successResponse({
      success: true,
      summary: {
        performance_trend: trend,
        avg_rating: (avgRating * 100 + 50).toFixed(0) + '%',
        memories_archived: archivedCount,
        memories_boosted: frequentMemories.length,
        memories_decayed: decayedCount,
        behaviors_optimized: behaviorUpdates.length,
        experiments_completed: experimentResults.length,
        capabilities_auto_approved: autoApproved
      },
      recommendations: trend === 'declining' 
        ? ['Consider running feedback analysis', 'Review adaptive behaviors', 'Check for capability gaps']
        : trend === 'improving'
        ? ['Continue current approach', 'Consider A/B testing new features']
        : ['Monitor performance', 'Collect more user feedback']
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'evolve-system',
      error,
      requestId
    });
  }
});
