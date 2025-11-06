-- Create table for AI-generated platform improvements
CREATE TABLE IF NOT EXISTS public.platform_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  improvement_type TEXT NOT NULL CHECK (improvement_type IN (
    'performance',
    'security',
    'ux',
    'accessibility',
    'code_quality',
    'feature_enhancement',
    'bug_fix',
    'optimization'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  target_file TEXT NOT NULL,
  target_component TEXT,
  
  -- Analysis data
  issue_description TEXT NOT NULL,
  current_code TEXT,
  improved_code TEXT NOT NULL,
  rationale TEXT NOT NULL,
  impact_score REAL DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
  
  -- AI provider data
  analyzed_by TEXT NOT NULL,
  confidence_score REAL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model_used TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'approved',
    'applied',
    'rejected',
    'failed'
  )),
  auto_apply_eligible BOOLEAN DEFAULT false,
  
  -- Application tracking
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES auth.users(id),
  application_result JSONB,
  
  -- Rollback support
  rollback_available BOOLEAN DEFAULT true,
  rollback_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_platform_improvements_status ON public.platform_improvements(status);
CREATE INDEX idx_platform_improvements_type ON public.platform_improvements(improvement_type);
CREATE INDEX idx_platform_improvements_severity ON public.platform_improvements(severity);
CREATE INDEX idx_platform_improvements_created ON public.platform_improvements(created_at DESC);

-- Create table for improvement analysis runs
CREATE TABLE IF NOT EXISTS public.improvement_analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('scheduled', 'manual', 'triggered')),
  
  -- Analysis scope
  files_analyzed INTEGER DEFAULT 0,
  components_analyzed INTEGER DEFAULT 0,
  
  -- Results
  improvements_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_priority INTEGER DEFAULT 0,
  medium_priority INTEGER DEFAULT 0,
  low_priority INTEGER DEFAULT 0,
  
  -- AI orchestration data
  providers_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_tokens_used INTEGER DEFAULT 0,
  analysis_duration_ms INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
    'running',
    'completed',
    'failed',
    'cancelled'
  )),
  error_message TEXT,
  
  -- Metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES auth.users(id)
);

-- Create table for auto-apply configuration
CREATE TABLE IF NOT EXISTS public.auto_apply_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auto-apply rules
  enabled BOOLEAN DEFAULT false,
  auto_apply_performance BOOLEAN DEFAULT false,
  auto_apply_security BOOLEAN DEFAULT true,
  auto_apply_accessibility BOOLEAN DEFAULT false,
  auto_apply_code_quality BOOLEAN DEFAULT false,
  
  -- Safety thresholds
  min_confidence_score REAL DEFAULT 0.85 CHECK (min_confidence_score >= 0 AND min_confidence_score <= 1),
  max_changes_per_run INTEGER DEFAULT 10,
  require_tests_pass BOOLEAN DEFAULT true,
  
  -- GitHub integration (for full automation)
  github_auto_commit BOOLEAN DEFAULT false,
  github_create_pr BOOLEAN DEFAULT true,
  github_branch_prefix TEXT DEFAULT 'ai-improvement/',
  
  -- Notification settings
  notify_on_critical BOOLEAN DEFAULT true,
  notify_on_application BOOLEAN DEFAULT true,
  notification_email TEXT,
  
  -- Metadata
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO public.auto_apply_config (
  enabled,
  auto_apply_security,
  min_confidence_score,
  github_create_pr
) VALUES (
  false, -- Disabled by default for safety
  true,  -- Auto-apply security fixes
  0.85,  -- High confidence required
  true   -- Create PRs for review
);

-- Enable RLS
ALTER TABLE public.platform_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_apply_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin only)
CREATE POLICY "Super admins can view all improvements"
  ON public.platform_improvements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage improvements"
  ON public.platform_improvements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view analysis runs"
  ON public.improvement_analysis_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage analysis runs"
  ON public.improvement_analysis_runs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view config"
  ON public.auto_apply_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update config"
  ON public.auto_apply_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_platform_improvements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_platform_improvements_timestamp
  BEFORE UPDATE ON public.platform_improvements
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_improvements_updated_at();