import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { anthropicFetch } from '../_shared/api-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Provider configurations
const AI_PROVIDERS = {
  lovable: {
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    key: Deno.env.get('LOVABLE_API_KEY'),
    models: ['google/gemini-2.5-pro', 'google/gemini-2.5-flash']
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: Deno.env.get('OPENAI_API_KEY'),
    models: ['gpt-5-2025-08-07', 'gpt-5-mini-2025-08-07']
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    key: Deno.env.get('ANTHROPIC_API_KEY'),
    models: ['claude-sonnet-4-5']
  }
};

// File patterns to analyze
const ANALYSIS_TARGETS = {
  pages: /^src\/pages\/.*\.tsx?$/,
  components: /^src\/components\/.*\.tsx?$/,
  hooks: /^src\/hooks\/.*\.ts$/,
  utils: /^src\/lib\/.*\.ts$/,
  edgeFunctions: /^supabase\/functions\/.*\/index\.ts$/,
};

interface ImprovementSuggestion {
  type: string;
  severity: string;
  targetFile: string;
  targetComponent?: string;
  issueDescription: string;
  currentCode?: string;
  improvedCode: string;
  rationale: string;
  impactScore: number;
  confidenceScore: number;
  aiModel: string;
  autoApplyEligible: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { runType = 'scheduled' } = await req.json().catch(() => ({}));

    console.log('🚀 Starting AI Platform Optimization Run:', runType);

    // Create analysis run record
    const { data: runData, error: runError } = await supabase
      .from('improvement_analysis_runs')
      .insert({
        run_type: runType,
        status: 'running'
      })
      .select()
      .single();

    if (runError) throw runError;
    const runId = runData.id;

    // Get auto-apply configuration
    const { data: config } = await supabase
      .from('auto_apply_config')
      .select('*')
      .single();

    const startTime = Date.now();
    const improvements: ImprovementSuggestion[] = [];
    const providersUsed: string[] = [];

    // Define analysis categories
    const analysisCategories = [
      {
        name: 'Performance Optimization',
        prompt: `Analyze this code for performance improvements. Look for:
- Inefficient re-renders, missing React.memo or useMemo
- Inefficient loops or algorithms
- Large bundle sizes, missing code splitting
- Unoptimized images or assets
- Memory leaks
Return specific, actionable improvements with code examples.`,
        type: 'performance'
      },
      {
        name: 'Security Vulnerabilities',
        prompt: `Analyze this code for security issues. Look for:
- XSS vulnerabilities
- Unsafe data handling
- Exposed secrets or API keys
- Missing input validation
- Insecure authentication patterns
- SQL injection risks in edge functions
Return critical security fixes with code examples.`,
        type: 'security'
      },
      {
        name: 'Accessibility Improvements',
        prompt: `Analyze this code for accessibility issues. Look for:
- Missing ARIA labels
- Poor keyboard navigation
- Missing alt text on images
- Insufficient color contrast
- Non-semantic HTML
Return WCAG 2.1 AA compliant improvements with code examples.`,
        type: 'accessibility'
      },
      {
        name: 'Code Quality',
        prompt: `Analyze this code for quality improvements. Look for:
- Code duplication
- Complex functions that should be refactored
- Poor naming conventions
- Missing error handling
- Inconsistent patterns
Return clean code improvements with examples.`,
        type: 'code_quality'
      },
      {
        name: 'UX Enhancements',
        prompt: `Analyze this code for UX improvements. Look for:
- Missing loading states
- Poor error messages
- Confusing user flows
- Missing feedback mechanisms
- Inconsistent UI patterns
Return user-friendly improvements with code examples.`,
        type: 'ux'
      }
    ];

    // Read actual files to analyze
    console.log('📁 Reading project files...');
    const filesToAnalyze = await getProjectFiles();
    console.log(`Found ${filesToAnalyze.length} files to analyze`);

    // Orchestrate AI analysis across providers
    for (const category of analysisCategories) {
      console.log(`📊 Analyzing: ${category.name}`);

      // Use different AI providers for different categories
      let provider = 'lovable';
      let model = 'google/gemini-2.5-flash';

      if (category.type === 'security') {
        provider = 'anthropic';
        model = 'claude-sonnet-4-5';
      } else if (category.type === 'performance') {
        provider = 'openai';
        model = 'gpt-5-2025-08-07';
      }

      const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
      if (!providerConfig.key) {
        console.log(`⚠️ Skipping ${provider} - API key not configured`);
        continue;
      }

      // Sample files for analysis (analyze 5 files per category to manage token costs)
      const sampleFiles = filesToAnalyze
        .filter(f => {
          if (category.type === 'performance') return f.path.includes('/components/') || f.path.includes('/pages/');
          if (category.type === 'security') return f.path.includes('/functions/') || f.path.includes('/lib/');
          return true;
        })
        .slice(0, 5);

      if (sampleFiles.length === 0) {
        console.log(`No files to analyze for ${category.name}`);
        continue;
      }

      try {
        const fileContents = sampleFiles.map(f => 
          `\n\n=== FILE: ${f.path} ===\n${f.content.slice(0, 2000)}\n=== END FILE ===`
        ).join('');

        const analysisPrompt = `${category.prompt}

Analyze the following real code files from the Oneiros.me platform:
${fileContents}

Technology stack:
- React + TypeScript
- Supabase backend
- Shadcn UI components
- Tailwind CSS

Return improvements in this JSON format:
{
  "improvements": [
    {
      "targetFile": "exact/path/from/above.tsx",
      "targetComponent": "ComponentName",
      "issueDescription": "Specific issue found in the code",
      "improvedCode": "// Complete improved code snippet",
      "rationale": "Why this improvement matters",
      "impactScore": 7.5,
      "confidenceScore": 0.9,
      "severity": "high"
    }
  ]
}

Return ONLY valid JSON. Focus on real, actionable improvements from the actual code shown above.`;

        console.log(`Sending ${sampleFiles.length} files to ${provider}...`);
        const aiResponse = await callAIProvider(provider, model, analysisPrompt);
        console.log(`${provider} response:`, JSON.stringify(aiResponse).slice(0, 200));
        
        if (aiResponse.improvements && Array.isArray(aiResponse.improvements)) {
          console.log(`Found ${aiResponse.improvements.length} improvements from ${provider}`);
          
          for (const imp of aiResponse.improvements) {
            improvements.push({
              type: category.type,
              severity: imp.severity || 'medium',
              targetFile: imp.targetFile,
              targetComponent: imp.targetComponent,
              issueDescription: imp.issueDescription,
              improvedCode: imp.improvedCode,
              rationale: imp.rationale,
              impactScore: imp.impactScore || 5,
              confidenceScore: imp.confidenceScore || 0.7,
              aiModel: `${provider}/${model}`,
              autoApplyEligible: shouldAutoApply(imp, category.type, config)
            });
          }
          
          if (!providersUsed.includes(provider)) {
            providersUsed.push(provider);
          }
        } else {
          console.log(`⚠️ No improvements array in response from ${provider}`);
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${category.name}:`, error);
        console.error('Error details:', error instanceof Error ? error.stack : error);
      }
    }

    // Store improvements in database
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const improvement of improvements) {
      const { error: insertError } = await supabase
        .from('platform_improvements')
        .insert({
          improvement_type: improvement.type,
          severity: improvement.severity,
          target_file: improvement.targetFile,
          target_component: improvement.targetComponent,
          issue_description: improvement.issueDescription,
          improved_code: improvement.improvedCode,
          rationale: improvement.rationale,
          impact_score: improvement.impactScore,
          analyzed_by: improvement.aiModel,
          confidence_score: improvement.confidenceScore,
          ai_model_used: improvement.aiModel,
          auto_apply_eligible: improvement.autoApplyEligible,
          status: 'pending'
        });

      if (!insertError) {
        severityCounts[improvement.severity as keyof typeof severityCounts]++;
      }
    }

    // Update analysis run
    const duration = Date.now() - startTime;
    await supabase
      .from('improvement_analysis_runs')
      .update({
        status: 'completed',
        improvements_found: improvements.length,
        critical_issues: severityCounts.critical,
        high_priority: severityCounts.high,
        medium_priority: severityCounts.medium,
        low_priority: severityCounts.low,
        providers_used: providersUsed,
        analysis_duration_ms: duration,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId);

    // Auto-apply eligible improvements if enabled
    if (config?.enabled) {
      console.log('🤖 Auto-apply is enabled, processing eligible improvements...');
      
      const eligibleImprovements = improvements.filter(imp => imp.autoApplyEligible);
      
      // Apply improvements asynchronously (fire and forget)
      applyImprovements(supabase, eligibleImprovements, config).catch(error => {
        console.error('Error in auto-apply:', error);
      });
    }

    console.log(`✅ Analysis complete: ${improvements.length} improvements found`);

    return new Response(
      JSON.stringify({
        success: true,
        runId,
        improvementsFound: improvements.length,
        severityCounts,
        providersUsed,
        durationMs: duration,
        autoApplyEnabled: config?.enabled || false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in AI Platform Optimizer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getProjectFiles() {
  const files: { path: string; content: string }[] = [];
  
  try {
    // In Deno, we need to walk the file system
    // This is a simplified version - in production you'd use Deno.readDir recursively
    const projectRoot = Deno.cwd();
    
    // For now, return a sample set of known important files
    // In a real implementation, you'd walk the directory tree
    const importantPaths = [
      'src/pages/Index.tsx',
      'src/components/ChatInterface.tsx',
      'src/hooks/useSmartAIRouter.ts',
      'supabase/functions/chat-stream-with-routing/index.ts',
      'src/components/voice/GrokVoiceAgent.tsx'
    ];
    
    for (const path of importantPaths) {
      try {
        const fullPath = `${projectRoot}/${path}`;
        const content = await Deno.readTextFile(fullPath);
        files.push({ path, content });
      } catch (err) {
        // File doesn't exist, skip it
        console.log(`⚠️ Could not read ${path}`);
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error reading project files:', error);
    return [];
  }
}

async function callAIProvider(provider: string, model: string, prompt: string) {
  const config = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  
  let response: Response;
  let data: any;

  if (provider === 'anthropic') {
    response = await anthropicFetch('/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: 'You are an expert code analyzer. Return your analysis in valid JSON format.',
        messages: [{ role: 'user', content: prompt }]
      })
    }, {
      timeout: 90000,
      maxRetries: 2
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Anthropic API error: ${response.status} - ${errorText}`);
      throw new Error(`${provider} API error: ${response.status}`);
    }

    data = await response.json();
    
    if (!data?.content?.[0]?.text) {
      throw new Error('Invalid response structure from Anthropic API');
    }
    
    try {
      return JSON.parse(data.content[0].text);
    } catch {
      return { improvements: [] };
    }
  } else {
    // OpenAI and Lovable AI
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.key}`
    };

    const body: any = {
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    };
    
    if (provider === 'openai') {
      body.max_completion_tokens = 4096;
    }

    response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error: ${response.status} - ${errorText}`);
      throw new Error(`${provider} API error: ${response.status}`);
    }

    data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error(`Invalid response structure from ${provider} API`);
    }

    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return { improvements: [] };
    }
  }
}

function shouldAutoApply(
  improvement: any,
  type: string,
  config: any
): boolean {
  if (!config?.enabled) return false;
  
  // Check type-specific auto-apply rules
  const typeEnabled = {
    'security': config.auto_apply_security,
    'performance': config.auto_apply_performance,
    'accessibility': config.auto_apply_accessibility,
    'code_quality': config.auto_apply_code_quality
  }[type];

  if (!typeEnabled) return false;

  // Check confidence threshold
  if ((improvement.confidenceScore || 0) < config.min_confidence_score) {
    return false;
  }

  // Security fixes are always eligible if confidence is high
  if (type === 'security' && improvement.severity === 'critical') {
    return true;
  }

  return true;
}

async function applyImprovements(
  supabase: any,
  improvements: ImprovementSuggestion[],
  config: any
) {
  console.log(`🔧 Applying ${improvements.length} improvements...`);
  
  // Sort by impact score (highest first)
  const sortedImprovements = improvements
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, config.max_changes_per_run);

  for (const improvement of sortedImprovements) {
    try {
      // Here you would integrate with GitHub API to:
      // 1. Create a new branch
      // 2. Apply the code changes
      // 3. Commit and push
      // 4. Optionally create a PR
      
      // For now, we'll just mark them as "applied" in the database
      // and log the details for the super admin to review
      
      const { data: improvementRecord } = await supabase
        .from('platform_improvements')
        .select('id')
        .eq('target_file', improvement.targetFile)
        .eq('improved_code', improvement.improvedCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (improvementRecord) {
        await supabase
          .from('platform_improvements')
          .update({
            status: 'approved',
            application_result: {
              method: 'automated',
              timestamp: new Date().toISOString(),
              note: 'Marked for auto-apply. GitHub API integration required for automatic commits.'
            }
          })
          .eq('id', improvementRecord.id);
        
        console.log(`✅ Approved: ${improvement.targetFile}`);
      }
    } catch (error) {
      console.error(`❌ Error applying improvement:`, error);
    }
  }
}
