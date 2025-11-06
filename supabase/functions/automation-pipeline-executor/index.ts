import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PipelineStep {
  type: 'vision' | 'generation' | 'reasoning' | 'code-analysis' | 'workflow' | 'search';
  config: Record<string, any>;
  cacheKey?: string;
}

interface PipelineConfig {
  steps: PipelineStep[];
  passDataBetweenSteps: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { pipelineId, manualRun = false } = await req.json();

    // Fetch pipeline configuration
    const { data: pipeline, error: pipelineError } = await supabase
      .from("automation_pipelines")
      .select("*")
      .eq("id", pipelineId)
      .single();

    if (pipelineError || !pipeline) {
      throw new Error("Pipeline not found");
    }

    if (!pipeline.is_active && !manualRun) {
      return new Response(
        JSON.stringify({ error: "Pipeline is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = pipeline.pipeline_config as PipelineConfig;
    const startTime = Date.now();

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from("pipeline_executions")
      .insert({
        pipeline_id: pipelineId,
        status: "running",
        steps_total: config.steps.length,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (execError) throw execError;

    const results: any[] = [];
    let previousResult: any = null;

    try {
      // Execute each step in sequence
      for (let i = 0; i < config.steps.length; i++) {
        const step = config.steps[i];
        console.log(`Executing step ${i + 1}/${config.steps.length}: ${step.type}`);

        // Check cache first if cacheKey provided
        if (step.cacheKey) {
          const { data: cached } = await supabase
            .from("ai_response_cache")
            .select("*")
            .eq("cache_key", step.cacheKey)
            .gt("expires_at", new Date().toISOString())
            .single();

          if (cached) {
            console.log(`Cache hit for step ${i + 1}`);
            await supabase
              .from("ai_response_cache")
              .update({
                hit_count: cached.hit_count + 1,
                last_accessed_at: new Date().toISOString(),
              })
              .eq("id", cached.id);

            results.push(cached.response_data);
            previousResult = cached.response_data;
            continue;
          }
        }

        // Execute step based on type
        let stepResult: any;
        const stepConfig = config.passDataBetweenSteps && previousResult
          ? { ...step.config, previousStepData: previousResult }
          : step.config;

        switch (step.type) {
          case "vision":
            const { data: visionData } = await supabase.functions.invoke("xai-vision-analyzer", {
              body: stepConfig,
            });
            stepResult = visionData;
            break;

          case "generation":
            const { data: genData } = await supabase.functions.invoke("xai-image-generator", {
              body: stepConfig,
            });
            stepResult = genData;
            break;

          case "reasoning":
            const { data: reasonData } = await supabase.functions.invoke("grok-reality-agent", {
              body: { ...stepConfig, mode: "reasoning" },
            });
            stepResult = reasonData;
            break;

          case "code-analysis":
            const { data: codeData } = await supabase.functions.invoke("xai-code-analyzer", {
              body: stepConfig,
            });
            stepResult = codeData;
            break;

          case "workflow":
            const { data: workflowData } = await supabase.functions.invoke("xai-workflow-executor", {
              body: stepConfig,
            });
            stepResult = workflowData;
            break;

          case "search":
            const { data: searchData } = await supabase.functions.invoke("grok-reality-agent", {
              body: { ...stepConfig, mode: "search" },
            });
            stepResult = searchData;
            break;
        }

        results.push(stepResult);
        previousResult = stepResult;

        // Cache result if cacheKey provided
        if (step.cacheKey && stepResult) {
          await supabase.from("ai_response_cache").upsert({
            cache_key: step.cacheKey,
            operation_type: step.type,
            request_hash: JSON.stringify(stepConfig),
            response_data: stepResult,
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour cache
          });
        }

        // Update progress
        await supabase
          .from("pipeline_executions")
          .update({ steps_completed: i + 1 })
          .eq("id", execution.id);
      }

      const duration = Date.now() - startTime;

      // Mark execution as successful
      await supabase
        .from("pipeline_executions")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          results: { steps: results, finalResult: previousResult },
        })
        .eq("id", execution.id);

      // Update pipeline stats
      await supabase
        .from("automation_pipelines")
        .update({
          last_run_at: new Date().toISOString(),
          success_count: pipeline.success_count + 1,
        })
        .eq("id", pipelineId);

      return new Response(
        JSON.stringify({
          success: true,
          executionId: execution.id,
          results,
          duration: duration,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (stepError) {
      console.error("Pipeline step error:", stepError);

      // Mark execution as failed
      await supabase
        .from("pipeline_executions")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: stepError instanceof Error ? stepError.message : "Unknown error",
        })
        .eq("id", execution.id);

      // Update pipeline failure count
      await supabase
        .from("automation_pipelines")
        .update({
          last_run_at: new Date().toISOString(),
          failure_count: pipeline.failure_count + 1,
        })
        .eq("id", pipelineId);

      throw stepError;
    }
  } catch (error) {
    console.error("Pipeline executor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
