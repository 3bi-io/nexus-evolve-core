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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { monitorId } = await req.json();

    // Fetch monitor configuration
    const { data: monitor, error: monitorError } = await supabase
      .from("scheduled_monitors")
      .select("*")
      .eq("id", monitorId)
      .single();

    if (monitorError || !monitor) {
      throw new Error("Monitor not found");
    }

    console.log(`Executing monitor: ${monitor.monitor_type} for target: ${monitor.target}`);

    let results: any = {};
    let alerts: any[] = [];
    let status = "success";

    try {
      // Execute monitoring based on type
      switch (monitor.monitor_type) {
        case "trends":
          // Fetch trending topics related to target
          const { data: grokTrends } = await supabase.functions.invoke("grok-reality-agent", {
            body: {
              query: `Find trending topics and discussions about ${monitor.target}. Include sentiment, volume, and key insights.`,
              mode: "search",
              userId: monitor.user_id,
            },
          });

          results = {
            trends: grokTrends?.results || [],
            sentiment: grokTrends?.sentiment || "neutral",
            volume: grokTrends?.volume || 0,
          };

          // Check alert thresholds
          if (monitor.alert_threshold) {
            const threshold = monitor.alert_threshold as any;
            if (threshold.volume && results.volume > threshold.volume) {
              alerts.push({
                type: "volume_spike",
                message: `High volume detected: ${results.volume} mentions`,
                severity: "high",
              });
              status = "alert_triggered";
            }
            if (threshold.sentiment && results.sentiment === "negative" && threshold.sentiment === "negative") {
              alerts.push({
                type: "negative_sentiment",
                message: "Negative sentiment detected",
                severity: "medium",
              });
              status = "alert_triggered";
            }
          }
          break;

        case "sentiment":
          // Analyze sentiment for target
          const { data: sentimentData } = await supabase.functions.invoke("grok-reality-agent", {
            body: {
              query: `Analyze the current sentiment and public perception of ${monitor.target}. Provide detailed sentiment breakdown.`,
              mode: "reasoning",
              userId: monitor.user_id,
            },
          });

          results = {
            sentiment: sentimentData?.sentiment || "neutral",
            score: sentimentData?.score || 0,
            breakdown: sentimentData?.breakdown || {},
          };
          break;

        case "competitor":
          // Track competitor activity
          const { data: competitorData } = await supabase.functions.invoke("grok-reality-agent", {
            body: {
              query: `Research recent news, updates, and activities from ${monitor.target}. Focus on product launches, announcements, and market moves.`,
              mode: "search",
              userId: monitor.user_id,
            },
          });

          results = {
            updates: competitorData?.results || [],
            summary: competitorData?.summary || "",
          };
          break;

        case "keyword":
          // Monitor keyword mentions
          const { data: keywordData } = await supabase.functions.invoke("grok-reality-agent", {
            body: {
              query: `Find recent mentions and discussions about "${monitor.target}". Include context and sentiment.`,
              mode: "search",
              userId: monitor.user_id,
            },
          });

          results = {
            mentions: keywordData?.results || [],
            count: keywordData?.count || 0,
          };
          break;

        case "brand":
          // Comprehensive brand monitoring
          const { data: brandData } = await supabase.functions.invoke("grok-reality-agent", {
            body: {
              query: `Comprehensive brand analysis for ${monitor.target}: sentiment, mentions, trending topics, and brand health indicators.`,
              mode: "search",
              userId: monitor.user_id,
            },
          });

          results = {
            brandHealth: brandData?.brandHealth || {},
            mentions: brandData?.mentions || [],
            sentiment: brandData?.sentiment || "neutral",
            trends: brandData?.trends || [],
          };
          break;
      }

      // Store results
      await supabase.from("monitor_results").insert({
        monitor_id: monitorId,
        status,
        results,
        alerts,
        metrics: {
          data_points: Array.isArray(results.trends) ? results.trends.length : 0,
          execution_time: Date.now(),
        },
      });

      // Update monitor last run
      await supabase
        .from("scheduled_monitors")
        .update({ last_run_at: new Date().toISOString() })
        .eq("id", monitorId);

      // Send notifications if alerts triggered
      if (alerts.length > 0 && monitor.notification_channels) {
        console.log(`Alerts triggered: ${JSON.stringify(alerts)}`);
        // TODO: Implement notification sending (email, webhook, in-app)
      }

      return new Response(
        JSON.stringify({ success: true, status, results, alerts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (execError) {
      console.error("Monitor execution error:", execError);

      await supabase.from("monitor_results").insert({
        monitor_id: monitorId,
        status: "failed",
        results: {},
        error_message: execError instanceof Error ? execError.message : "Unknown error",
      });

      throw execError;
    }
  } catch (error) {
    console.error("Scheduled monitor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
