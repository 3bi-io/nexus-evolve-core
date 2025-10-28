import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");

    console.log(`Running daily evolution for user ${user.id}`);

    // 1. PERFORMANCE ANALYSIS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentInteractions } = await supabase
      .from("interactions")
      .select("quality_rating, created_at, context")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

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

    const trend = recentAvg > previousAvg ? "improving" : 
                  recentAvg < previousAvg ? "declining" : "stable";

    console.log(`Performance: ${(avgRating * 100 + 50).toFixed(0)}%, Trend: ${trend}`);

    // 2. KNOWLEDGE CONSOLIDATION
    const { data: memories } = await supabase
      .from("agent_memory")
      .select("*")
      .eq("user_id", user.id)
      .order("retrieval_count", { ascending: true });

    // Archive rarely-used memories (retrieval_count = 0 and older than 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const memoriesToArchive = memories?.filter(m => 
      m.retrieval_count === 0 && new Date(m.created_at) < sixtyDaysAgo
    ) || [];

    let archivedCount = 0;
    if (memoriesToArchive.length > 0) {
      const { error } = await supabase
        .from("agent_memory")
        .delete()
        .in("id", memoriesToArchive.map(m => m.id));
      
      if (!error) {
        archivedCount = memoriesToArchive.length;
      }
    }

    // Boost importance of frequently-used memories
    const frequentMemories = memories?.filter(m => m.retrieval_count > 5) || [];
    for (const memory of frequentMemories) {
      const newImportance = Math.min(1.0, memory.importance_score + 0.05);
      await supabase
        .from("agent_memory")
        .update({ importance_score: newImportance })
        .eq("id", memory.id);
    }

    console.log(`Knowledge consolidation: archived ${archivedCount}, boosted ${frequentMemories.length}`);

    // 3. ADAPTIVE BEHAVIOR OPTIMIZATION
    const { data: behaviors } = await supabase
      .from("adaptive_behaviors")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true);

    // Deactivate behaviors with low effectiveness and low usage
    const behaviorUpdates = [];
    for (const behavior of behaviors || []) {
      if (behavior.effectiveness_score < 0.3 && behavior.application_count > 10) {
        await supabase
          .from("adaptive_behaviors")
          .update({ active: false })
          .eq("id", behavior.id);
        behaviorUpdates.push({ id: behavior.id, action: "deactivated" });
      }
    }

    // 4. A/B TEST EVALUATION (if any active)
    const { data: activeExperiments } = await supabase
      .from("ab_experiments")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true);

    let experimentResults = [];
    for (const experiment of activeExperiments || []) {
      // Simple evaluation: if running for > 7 days, evaluate
      const startDate = new Date(experiment.started_at);
      const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceStart >= 7) {
        // Determine winner based on metrics (simplified)
        const metrics = experiment.metrics || {};
        const winner = metrics.test_score > metrics.control_score ? "test" : "control";
        
        await supabase
          .from("ab_experiments")
          .update({
            active: false,
            ended_at: new Date().toISOString(),
            winner
          })
          .eq("id", experiment.id);

        experimentResults.push({
          experiment: experiment.experiment_name,
          winner,
          duration_days: Math.floor(daysSinceStart)
        });
      }
    }

    // 5. CAPABILITY AUTO-ACTIVATION (high confidence suggestions)
    const { data: pendingSuggestions } = await supabase
      .from("capability_suggestions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("confidence_score", 0.8);

    let autoApproved = 0;
    for (const suggestion of pendingSuggestions || []) {
      // Auto-approve high-confidence suggestions
      await supabase
        .from("capability_suggestions")
        .update({ 
          status: "approved",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", suggestion.id);

      // Create the capability
      await supabase
        .from("capability_modules")
        .insert({
          user_id: user.id,
          capability_name: suggestion.capability_name,
          description: suggestion.description,
          is_enabled: true
        });

      autoApproved++;
    }

    console.log(`Auto-approved ${autoApproved} high-confidence capabilities`);

    // 6. META-LEARNING: Optimize learning parameters
    const learningEfficiency = avgRating > 0 ? "good" : "needs_improvement";
    
    // Log comprehensive evolution report
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "system_evolution",
      description: `Daily evolution cycle: ${trend} performance, ${archivedCount} memories archived, ${behaviorUpdates.length} behaviors optimized`,
      change_type: "auto_discovery",
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

    console.log("Evolution cycle complete");

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          performance_trend: trend,
          avg_rating: (avgRating * 100 + 50).toFixed(0) + "%",
          memories_archived: archivedCount,
          memories_boosted: frequentMemories.length,
          behaviors_optimized: behaviorUpdates.length,
          experiments_completed: experimentResults.length,
          capabilities_auto_approved: autoApproved
        },
        recommendations: trend === "declining" 
          ? ["Consider running feedback analysis", "Review adaptive behaviors", "Check for capability gaps"]
          : trend === "improving"
          ? ["Continue current approach", "Consider A/B testing new features"]
          : ["Monitor performance", "Collect more user feedback"]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("System evolution error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
