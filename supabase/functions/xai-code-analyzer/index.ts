import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { createLogger } from "../_shared/logger.ts";
import { optionalAuth } from "../_shared/auth.ts";
import { initSupabaseClient } from "../_shared/supabase-client.ts";
import { validateRequiredFields } from "../_shared/validators.ts";
import { xAIFetch } from "../_shared/api-client.ts";

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

  const requestId = crypto.randomUUID();
  const logger = createLogger("xai-code-analyzer", requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    const body: CodeAnalysisRequest = await req.json();
    validateRequiredFields(body, ["code"]);
    
    const {
      code,
      language = "auto",
      analysisType = "review",
      model = "grok-code-fast-1",
    } = body;

    logger.info("Analyzing code", { 
      userId: user?.id || 'anonymous',
      isAnonymous,
      language, 
      analysisType, 
      codeLength: code.length 
    });

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

    const response = await xAIFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `\`\`\`${language}\n${code}\n\`\`\`` },
        ],
        temperature: 0.3,
      }),
    }, { timeout: 60000 });

    const analysisTime = Date.now() - startTime;

    if (!response.ok) throw response;

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

    // Log analytics only for authenticated users
    if (!isAnonymous) {
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
    }

    logger.info("Code analysis complete", { analysisTime, tokensUsed });

    return successResponse({
      success: true,
      analysis,
      analysis_type: analysisType,
      language,
      model,
      processing_time_ms: analysisTime,
      cost_credits: costCredits,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: "xai-code-analyzer",
      error,
      requestId,
    });
  }
});
