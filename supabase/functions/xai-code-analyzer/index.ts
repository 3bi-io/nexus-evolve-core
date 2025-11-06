import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CodeAnalysisRequest {
  code: string;
  language?: string;
  analysisType?: "review" | "bugs" | "security" | "performance" | "docs" | "refactor";
  model?: string;
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

    const {
      code,
      language = "auto",
      analysisType = "review",
      model = "grok-code-fast-1",
    } = await req.json() as CodeAnalysisRequest;

    console.log(`Analyzing code with ${model} (${analysisType})`);

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) throw new Error("GROK_API_KEY not configured");

    // Build analysis prompt based on type
    const prompts: Record<string, string> = {
      review: "Review this code for best practices, code quality, and potential improvements. Provide specific, actionable feedback.",
      bugs: "Identify bugs, errors, and potential runtime issues in this code. Explain each issue and suggest fixes.",
      security: "Analyze this code for security vulnerabilities including SQL injection, XSS, authentication issues, and data exposure. Provide severity levels and remediation steps.",
      performance: "Analyze this code for performance bottlenecks, inefficient algorithms, and optimization opportunities. Suggest specific improvements.",
      docs: "Generate comprehensive documentation for this code including function descriptions, parameter explanations, return values, and usage examples.",
      refactor: "Suggest refactoring improvements for this code to make it more maintainable, readable, and follow best practices. Provide refactored code.",
    };

    const systemPrompt = `You are an expert code reviewer specializing in ${language} programming. ${prompts[analysisType]}

Format your response as structured JSON:
{
  "summary": "Brief overview",
  "issues": [{"severity": "high|medium|low", "line": number, "description": "...", "suggestion": "..."}],
  "recommendations": ["..."],
  "score": 0-100
}`;

    const startTime = Date.now();

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `\`\`\`${language}\n${code}\n\`\`\`` },
        ],
        temperature: 0.3,
      }),
    });

    const analysisTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);

      await supabase.from("xai_usage_analytics").insert({
        user_id: user.id,
        model_id: model,
        feature_type: "code-analysis",
        success: false,
        error_message: errorText,
        latency_ms: analysisTime,
      });

      throw new Error(`Code analysis failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const analysisText = result.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let analysis: any;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: analysisText };
    } catch {
      analysis = { summary: analysisText, raw: true };
    }

    const tokensUsed = result.usage?.total_tokens || 1000;
    const costCredits = (tokensUsed / 1000000) * 0.5;

    await supabase.from("xai_usage_analytics").insert({
      user_id: user.id,
      model_id: model,
      feature_type: "code-analysis",
      tokens_used: tokensUsed,
      cost_credits: costCredits,
      latency_ms: analysisTime,
      success: true,
      metadata: { language, analysis_type: analysisType, code_length: code.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        analysis_type: analysisType,
        language,
        model,
        processing_time_ms: analysisTime,
        cost_credits: costCredits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Code analysis error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
