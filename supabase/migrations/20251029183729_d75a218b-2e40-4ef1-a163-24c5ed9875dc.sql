-- Create achievements system tables
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'conversation', 'learning', 'quality', 'explorer', 'evolution'
  icon TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_key TEXT NOT NULL REFERENCES achievement_definitions(achievement_key),
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Enable RLS
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions (public read)
CREATE POLICY "Anyone can view achievement definitions"
  ON achievement_definitions FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievement_definitions (achievement_key, name, description, category, icon, target_value) VALUES
  ('first_steps', 'First Steps', 'Send your first message', 'conversation', 'MessageSquare', 1),
  ('conversationalist', 'Conversationalist', 'Complete 10 conversations', 'conversation', 'MessageSquare', 10),
  ('chatty', 'Chatty', 'Send 50 messages', 'conversation', 'MessageSquare', 50),
  ('centurion', 'Centurion', 'Reach 100 total messages', 'conversation', 'MessageSquare', 100),
  
  ('knowledge_seeker', 'Knowledge Seeker', 'Extract your first learning', 'learning', 'Brain', 1),
  ('wisdom_keeper', 'Wisdom Keeper', 'Extract 10 learnings', 'learning', 'Brain', 10),
  ('knowledge_master', 'Knowledge Master', 'Build a knowledge base of 50+ concepts', 'learning', 'Brain', 50),
  
  ('feedback_starter', '5-Star Talker', 'Give 10 positive ratings', 'quality', 'Star', 10),
  ('feedback_master', 'Feedback Master', 'Rate 50 responses', 'quality', 'Star', 50),
  
  ('multi_agent', 'Multi-Agent Explorer', 'Try all agent types', 'explorer', 'Zap', 4),
  ('graph_enthusiast', 'Graph Enthusiast', 'Visit the Knowledge Graph', 'explorer', 'Network', 1),
  ('evolution_tracker', 'Evolution Tracker', 'Check the Evolution Dashboard', 'explorer', 'TrendingUp', 1),
  
  ('system_improver', 'System Improver', 'Trigger manual evolution', 'evolution', 'Sparkles', 1),
  ('pattern_master', 'Pattern Master', 'Create 10 behavioral patterns', 'evolution', 'GitBranch', 10)
ON CONFLICT (achievement_key) DO NOTHING;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID, p_achievement_key TEXT, p_increment INTEGER DEFAULT 1)
RETURNS TABLE(
  achievement_unlocked BOOLEAN,
  achievement_name TEXT,
  achievement_description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_definition RECORD;
  v_current_progress INTEGER;
  v_completed BOOLEAN;
BEGIN
  -- Get achievement definition
  SELECT * INTO v_definition
  FROM achievement_definitions
  WHERE achievement_key = p_achievement_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, ''::TEXT;
    RETURN;
  END IF;
  
  -- Insert or update user achievement
  INSERT INTO user_achievements (user_id, achievement_key, progress)
  VALUES (p_user_id, p_achievement_key, p_increment)
  ON CONFLICT (user_id, achievement_key) 
  DO UPDATE SET 
    progress = user_achievements.progress + p_increment,
    completed_at = CASE 
      WHEN user_achievements.progress + p_increment >= v_definition.target_value 
           AND user_achievements.completed_at IS NULL 
      THEN NOW() 
      ELSE user_achievements.completed_at 
    END
  RETURNING progress, completed_at IS NOT NULL INTO v_current_progress, v_completed;
  
  -- Check if just completed
  IF v_completed AND v_current_progress = v_definition.target_value THEN
    RETURN QUERY SELECT 
      true, 
      v_definition.name, 
      v_definition.description;
  ELSE
    RETURN QUERY SELECT false, ''::TEXT, ''::TEXT;
  END IF;
END;
$$;