-- Create platform_optimizer_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_optimizer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_apply_enabled BOOLEAN DEFAULT false,
  allowed_types TEXT[] DEFAULT ARRAY['performance', 'security', 'accessibility', 'code_quality', 'ux'],
  min_confidence_threshold REAL DEFAULT 0.7,
  max_changes_per_run INTEGER DEFAULT 5,
  github_repo_url TEXT,
  github_base_branch TEXT DEFAULT 'main',
  github_auto_pr BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add GitHub integration columns to platform_improvements table
ALTER TABLE platform_improvements
ADD COLUMN IF NOT EXISTS github_pr_url TEXT,
ADD COLUMN IF NOT EXISTS github_pr_status TEXT CHECK (github_pr_status IN ('open', 'merged', 'closed')),
ADD COLUMN IF NOT EXISTS github_branch_name TEXT;

-- Create index for faster PR status lookups
CREATE INDEX IF NOT EXISTS idx_platform_improvements_github_pr_status 
ON platform_improvements(github_pr_status) 
WHERE github_pr_status IS NOT NULL;

-- Enable RLS on platform_optimizer_config
ALTER TABLE platform_optimizer_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_optimizer_config
CREATE POLICY "Users can view their own config"
ON platform_optimizer_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
ON platform_optimizer_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
ON platform_optimizer_config FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_platform_optimizer_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_optimizer_config_updated_at
BEFORE UPDATE ON platform_optimizer_config
FOR EACH ROW
EXECUTE FUNCTION update_platform_optimizer_config_updated_at();