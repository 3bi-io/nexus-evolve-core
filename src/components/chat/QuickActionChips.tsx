import { Button } from '@/components/ui/button';
import { Image, Search, BarChart3, Code, Mic, Sparkles, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResponsive, useHaptics } from '@/hooks/useResponsive';

interface QuickActionChipsProps {
  onAction: (action: string) => void;
  onVoiceActivate?: () => void;
  disabled?: boolean;
}

const QUICK_ACTIONS = [
  { icon: Image, label: 'Generate Image', mobileLabel: 'Image', prompt: 'Generate an image of ', color: 'text-pink-500' },
  { icon: Search, label: 'Search Web', mobileLabel: 'Search', prompt: '[SEARCH] ', color: 'text-blue-500' },
  { icon: BarChart3, label: 'Analyze Data', mobileLabel: 'Analyze', prompt: 'Analyze and summarize: ', color: 'text-green-500' },
  { icon: Code, label: 'Write Code', mobileLabel: 'Code', prompt: 'Write code to ', color: 'text-orange-500' },
  { icon: Sparkles, label: 'Brainstorm', mobileLabel: 'Ideas', prompt: 'Help me brainstorm ideas for ', color: 'text-purple-500' },
  { icon: FileText, label: 'Summarize', mobileLabel: 'Summarize', prompt: 'Summarize the following: ', color: 'text-cyan-500' },
];

export function QuickActionChips({ onAction, onVoiceActivate, disabled }: QuickActionChipsProps) {
  const { isMobile } = useResponsive();
  const { light } = useHaptics();

  const handleAction = (prompt: string) => {
    light();
    onAction(prompt);
  };

  if (isMobile) {
    // Mobile: Grid layout with larger touch targets
    return (
      <motion.div 
        className="grid grid-cols-3 gap-2 p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Button
                variant="outline"
                onClick={() => handleAction(action.prompt)}
                disabled={disabled}
                className="flex flex-col items-center gap-1.5 w-full h-auto py-3 px-2
                  touch-manipulation active:scale-95 transition-all duration-200
                  bg-background/80 backdrop-blur-sm border-border/50 
                  hover:bg-accent/50 hover:border-primary/30"
              >
                <Icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.mobileLabel}</span>
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  // Desktop: Horizontal wrapping chips
  return (
    <motion.div 
      className="flex flex-wrap gap-2 px-4 py-3 justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {QUICK_ACTIONS.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(action.prompt)}
              disabled={disabled}
              className="gap-2 h-9 px-3 rounded-full bg-background/80 backdrop-blur-sm 
                border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all"
            >
              <Icon className={`h-4 w-4 ${action.color}`} />
              <span>{action.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
