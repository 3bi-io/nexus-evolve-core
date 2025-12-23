import { Button } from '@/components/ui/button';
import { Image, Search, BarChart3, Code, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionChipsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
}

const QUICK_ACTIONS = [
  { icon: Image, label: 'Generate Image', prompt: 'Generate an image of ', color: 'text-pink-500' },
  { icon: Search, label: 'Search Web', prompt: '[SEARCH] ', color: 'text-blue-500' },
  { icon: BarChart3, label: 'Analyze Data', prompt: 'Analyze and summarize: ', color: 'text-green-500' },
  { icon: Code, label: 'Write Code', prompt: 'Write code to ', color: 'text-orange-500' },
  { icon: Sparkles, label: 'Brainstorm', prompt: 'Help me brainstorm ideas for ', color: 'text-purple-500' },
];

export function QuickActionChips({ onAction, disabled }: QuickActionChipsProps) {
  return (
    <motion.div 
      className="flex flex-wrap gap-2 px-1 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.05 }}
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
              onClick={() => onAction(action.prompt)}
              disabled={disabled}
              className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-muted/80 hover:border-primary/30 transition-all touch-feedback"
            >
              <Icon className={`h-3.5 w-3.5 ${action.color}`} />
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">{action.label.split(' ')[0]}</span>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
