import { Button } from '@/components/ui/button';
import { Lightbulb, Brain, Copy, BookOpen } from 'lucide-react';

interface QuickActionsProps {
  lastResponse: string;
  onAction: (action: string, prompt: string) => void;
}

export function QuickActions({ lastResponse, onAction }: QuickActionsProps) {
  const actions = [
    {
      icon: Brain,
      label: 'Break this down',
      prompt: 'Can you break down the previous response into simpler concepts?',
      visible: lastResponse.length > 200,
    },
    {
      icon: Lightbulb,
      label: 'Explain like I\'m 5',
      prompt: 'Can you explain the previous response in simpler terms, as if explaining to a 5-year-old?',
      visible: true,
    },
    {
      icon: BookOpen,
      label: 'Show related concepts',
      prompt: 'What are some related concepts or topics I should know about?',
      visible: true,
    },
    {
      icon: Copy,
      label: 'Give me examples',
      prompt: 'Can you provide practical examples of what you just explained?',
      visible: true,
    },
  ];

  const visibleActions = actions.filter(a => a.visible);

  if (visibleActions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {visibleActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onAction(action.label, action.prompt)}
            className="gap-2 text-xs"
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
