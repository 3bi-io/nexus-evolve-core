import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const CHECKLIST_ITEMS = [
  { id: 'first_message', label: 'Send your first message', completed: false },
  { id: 'try_agent', label: 'Try different AI agents', completed: false },
  { id: 'extract_learning', label: 'Extract a learning', completed: false },
  { id: 'view_knowledge', label: 'Visit Knowledge Graph', completed: false },
  { id: 'rate_response', label: 'Rate an AI response', completed: false },
];

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('onboarding_progress')
        .eq('user_id', user.id)
        .single();

      if (data?.onboarding_progress) {
        const progress = data.onboarding_progress as Record<string, boolean>;
        setItems(items.map(item => ({
          ...item,
          completed: progress[item.id] || false
        })));
      }
    };

    loadProgress();
  }, [user]);

  const updateProgress = async (itemId: string) => {
    if (!user) return;

    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: true } : item
    );
    setItems(updatedItems);

    const progress = updatedItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.completed
    }), {});

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        onboarding_progress: progress
      });
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = (completedCount / items.length) * 100;
  const isComplete = completedCount === items.length;

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 animate-slide-in-right">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Getting Started</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? '▲' : '▼'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedCount} of {items.length} completed</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Completion Message */}
            {isComplete && (
              <div className="pt-2 border-t animate-fade-in">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-primary">🎉 All done!</p>
                  <p className="text-xs text-muted-foreground">
                    You've mastered the basics. Keep exploring!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

// Export helper function to mark items complete
export async function markChecklistComplete(itemId: string, userId: string) {
  const { data } = await supabase
    .from('user_preferences')
    .select('onboarding_progress')
    .eq('user_id', userId)
    .single();

  const currentProgress = (data?.onboarding_progress as Record<string, boolean>) || {};
  
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      onboarding_progress: {
        ...currentProgress,
        [itemId]: true
      }
    });
}
