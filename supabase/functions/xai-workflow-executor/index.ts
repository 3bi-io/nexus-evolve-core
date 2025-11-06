import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowStep {
  type: "vision" | "image-gen" | "reasoning" | "code-analysis" | "search";
  input: string | any;
  config?: any;
}

interface WorkflowRequest {
  workflowId: string;
  steps: WorkflowStep[];
  initialInput: any;
}

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

    const { workflowId, steps, initialInput } = await req.json() as WorkflowRequest;

    console.log(`Executing workflow ${workflowId} with ${steps.length} steps`);

    const results: any[] = [];
    let currentInput = initialInput;
    const startTime = Date.now();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`Step ${i + 1}: ${step.type}`);

      try {
        const stepStartTime = Date.now();
        let stepResult: any;

        switch (step.type) {
          case "vision":
            stepResult = await executeVisionStep(supabase, currentInput, step.config);
            break;
          case "image-gen":
            stepResult = await executeImageGenStep(supabase, currentInput, step.config);
            break;
          case "reasoning":
            stepResult = await executeReasoningStep(supabase, currentInput, step.config);
            break;
          case "code-analysis":
            stepResult = await executeCodeAnalysisStep(supabase, currentInput, step.config);
            break;
          case "search":
            stepResult = await executeSearchStep(supabase, currentInput, step.config);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        const stepTime = Date.now() - stepStartTime;
        results.push({
          step: i + 1,
          type: step.type,
          result: stepResult,
          executionTime: stepTime,
          success: true,
        });

        // Use the result as input for the next step
        currentInput = stepResult.output || stepResult.result || stepResult;

      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error);
        results.push({
          step: i + 1,
          type: step.type,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
        break; // Stop workflow on error
      }
    }

    const totalTime = Date.now() - startTime;

    // Log workflow execution
    await supabase.from("xai_usage_analytics").insert({
      user_id: user.id,
      model_id: "workflow-executor",
      feature_type: "workflow",
      latency_ms: totalTime,
      success: results.every(r => r.success),
      metadata: {
        workflow_id: workflowId,
        steps: steps.length,
        completed_steps: results.filter(r => r.success).length,
      },
    });

    return new Response(
      JSON.stringify({
        success: results.every(r => r.success),
        workflowId,
        results,
        totalExecutionTime: totalTime,
        stepsCompleted: results.filter(r => r.success).length,
        stepsTotal: steps.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Workflow executor error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeVisionStep(supabase: any, input: any, config: any) {
  const { data, error } = await supabase.functions.invoke("xai-vision-analyzer", {
    body: {
      imageUrl: input.imageUrl || input,
      query: config?.query || "Describe this image in detail",
      model: config?.model,
    },
  });

  if (error) throw error;
  return { output: data.analysis, raw: data };
}

async function executeImageGenStep(supabase: any, input: any, config: any) {
  const prompt = typeof input === "string" ? input : input.prompt || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke("xai-image-generator", {
    body: {
      prompt,
      negativePrompt: config?.negativePrompt,
      numImages: config?.numImages || 1,
    },
  });

  if (error) throw error;
  return { output: data.images[0], images: data.images, raw: data };
}

async function executeReasoningStep(supabase: any, input: any, config: any) {
  const content = typeof input === "string" ? input : JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke("grok-reality-agent", {
    body: {
      action: "reasoning",
      content,
      context: config?.context,
      model: config?.model || "grok-4",
      searchMode: config?.searchMode || "on",
      returnCitations: true,
    },
  });

  if (error) throw error;
  return { output: data.reasoning, raw: data };
}

async function executeCodeAnalysisStep(supabase: any, input: any, config: any) {
  const code = typeof input === "string" ? input : input.code || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke("xai-code-analyzer", {
    body: {
      code,
      language: config?.language || "auto",
      analysisType: config?.analysisType || "review",
    },
  });

  if (error) throw error;
  return { output: data.analysis, raw: data };
}

async function executeSearchStep(supabase: any, input: any, config: any) {
  const query = typeof input === "string" ? input : input.query || JSON.stringify(input);

  const { data, error } = await supabase.functions.invoke("grok-reality-agent", {
    body: {
      action: "search",
      topic: query,
      model: config?.model || "grok-3",
      searchMode: "on",
      returnCitations: true,
    },
  });

  if (error) throw error;
  return { output: data.answer, raw: data };
}
