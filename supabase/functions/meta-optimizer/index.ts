import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    console.log("Running meta-learning optimization...");

    // Get performance metrics
    const { data: recentLogs } = await supabase
      .from("evolution_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    // Analyze A/B test performance
    const { data: experiments } = await supabase
      .from("ab_experiments")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", false)
      .not("winner", "is", null);

    // Calculate optimal parameters
    const metrics: Record<string, any> = {};

    // Memory decay optimization
    const memoryEvents = recentLogs?.filter(l => l.log_type === "memory_consolidation") || [];
    if (memoryEvents.length > 0) {
      const avgBoostRate = memoryEvents.reduce((sum, e) => 
        sum + (e.metadata?.memories_boosted || 0), 0
      ) / memoryEvents.length;
      
      metrics.memory_decay_rate = {
        current: 0.1,
        optimal: avgBoostRate > 10 ? 0.08 : 0.12,
        reasoning: avgBoostRate > 10 ? "High boost rate, reduce decay" : "Low boost rate, increase decay",
      };
    }

    // Evolution frequency optimization
    const evolutionEvents = recentLogs?.filter(l => l.log_type === "system_evolution") || [];
    const avgTimeBetween = evolutionEvents.length > 1 
      ? (new Date(evolutionEvents[0].created_at).getTime() - 
         new Date(evolutionEvents[evolutionEvents.length - 1].created_at).getTime()) 
        / (evolutionEvents.length - 1) / (1000 * 60 * 60) // hours
      : 24;

    metrics.evolution_frequency_hours = {
      current: 24,
      optimal: avgTimeBetween < 12 ? 18 : avgTimeBetween > 36 ? 30 : 24,
      reasoning: avgTimeBetween < 12 
        ? "Frequent changes, reduce frequency" 
        : avgTimeBetween > 36 
        ? "Slow changes, increase frequency"
        : "Optimal frequency",
    };

    // A/B test duration optimization
    if (experiments && experiments.length > 0) {
      const avgDuration = experiments.reduce((sum, e) => {
        const duration = new Date(e.ended_at!).getTime() - new Date(e.started_at).getTime();
        return sum + duration;
      }, 0) / experiments.length / (1000 * 60 * 60 * 24); // days

      metrics.ab_test_duration_days = {
        current: 7,
        optimal: avgDuration < 3 ? 5 : avgDuration > 10 ? 9 : 7,
        reasoning: avgDuration < 3
          ? "Quick decisions, reduce duration"
          : avgDuration > 10
          ? "Slow decisions, increase duration"
          : "Optimal duration",
      };
    }

    // Auto-approval threshold optimization
    const { data: capabilities } = await supabase
      .from("capability_suggestions")
      .select("*")
      .eq("user_id", user.id);

    const autoApproved = capabilities?.filter(c => c.status === "approved" && c.confidence_score >= 0.8) || [];
    const rejected = capabilities?.filter(c => c.status === "rejected") || [];
    
    if (capabilities && capabilities.length > 0) {
      const avgRejectedConfidence = rejected.length > 0
        ? rejected.reduce((sum, c) => sum + c.confidence_score, 0) / rejected.length
        : 0;

      metrics.auto_approval_threshold = {
        current: 0.8,
        optimal: avgRejectedConfidence > 0.7 ? 0.85 : rejected.length > autoApproved.length ? 0.75 : 0.8,
        reasoning: avgRejectedConfidence > 0.7
          ? "High-confidence rejections, increase threshold"
          : rejected.length > autoApproved.length
          ? "Many rejections, lower threshold"
          : "Balanced approval rate",
      };
    }

    // Store metrics
    for (const [metricName, metricData] of Object.entries(metrics)) {
      await supabase.from("meta_learning_metrics").insert({
        user_id: user.id,
        metric_type: "optimization",
        metric_name: metricName,
        metric_value: metricData.optimal,
        optimization_direction: "maximize",
        auto_adjusted: true,
        metadata: metricData,
      });
    }

    // Log optimization
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "meta_optimization",
      description: "Optimized system parameters",
      metadata: { optimized_metrics: Object.keys(metrics) },
    });

    console.log(`Optimized ${Object.keys(metrics).length} parameters`);

    return new Response(JSON.stringify({
      optimizations: metrics,
      recommendations: Object.entries(metrics).map(([key, value]) => ({
        parameter: key,
        ...value,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in meta-optimizer:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});