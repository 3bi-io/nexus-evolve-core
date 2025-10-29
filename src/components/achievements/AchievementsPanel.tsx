import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  achievement_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  target_value: number;
  progress: number;
  completed_at: string | null;
}

export function AchievementsPanel() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      // Get all achievement definitions
      const { data: definitions } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('category', { ascending: true });

      // Get user's achievement progress
      const { data: userProgress } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      // Merge data
      const merged = definitions?.map(def => {
        const progress = userProgress?.find(p => p.achievement_key === def.achievement_key);
        return {
          ...def,
          progress: progress?.progress || 0,
          completed_at: progress?.completed_at || null,
        };
      }) || [];

      setAchievements(merged);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      conversation: 'bg-blue-500/10 text-blue-500',
      learning: 'bg-purple-500/10 text-purple-500',
      quality: 'bg-yellow-500/10 text-yellow-500',
      explorer: 'bg-green-500/10 text-green-500',
      evolution: 'bg-pink-500/10 text-pink-500',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500';
  };

  const completedCount = achievements.filter(a => a.completed_at).length;
  const totalCount = achievements.length;

  if (loading) {
    return <div className="text-center py-8">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Your Achievements
          </h2>
          <p className="text-muted-foreground">
            {completedCount} of {totalCount} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{Math.round((completedCount / totalCount) * 100)}%</div>
          <Progress value={(completedCount / totalCount) * 100} className="w-24 mt-2" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const isCompleted = !!achievement.completed_at;
          const progressPercent = (achievement.progress / achievement.target_value) * 100;

          return (
            <Card 
              key={achievement.achievement_key}
              className={`${isCompleted ? 'border-primary bg-primary/5' : 'opacity-60'} transition-all hover:scale-105`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <div className="rounded-full bg-primary/20 p-2">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-muted p-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{achievement.name}</CardTitle>
                      <CardDescription className="text-xs">{achievement.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(achievement.category)} variant="outline">
                    {achievement.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isCompleted ? (
                  <div className="text-sm text-success font-semibold">
                    ✓ Completed {new Date(achievement.completed_at).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {achievement.progress} / {achievement.target_value}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
