import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAchievement, setShowAchievement] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const checkAchievement = useCallback(async (achievementKey: string, increment: number = 1) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('check_achievements', {
        p_user_id: user.id,
        p_achievement_key: achievementKey,
        p_increment: increment
      });

      if (error) throw error;

      if (data && data[0]?.achievement_unlocked) {
        const achievement = data[0];
        setShowAchievement({
          name: achievement.achievement_name,
          description: achievement.achievement_description
        });

        // Also show toast
        toast({
          title: '🏆 Achievement Unlocked!',
          description: `${achievement.achievement_name}: ${achievement.achievement_description}`,
          duration: 5000,
        });

        // Auto-hide after 5 seconds
        setTimeout(() => setShowAchievement(null), 5000);
      }
    } catch (error) {
      console.error('Error checking achievement:', error);
    }
  }, [user, toast]);

  const dismissAchievement = useCallback(() => {
    setShowAchievement(null);
  }, []);

  return {
    showAchievement,
    checkAchievement,
    dismissAchievement,
  };
}
