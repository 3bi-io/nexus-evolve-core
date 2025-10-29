import { motion } from 'framer-motion';
import { Bot, Brain, Lightbulb, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  agentType?: 'coordinator' | 'reasoning' | 'creative' | 'learning';
  estimatedTime?: number;
}

const agentIcons = {
  coordinator: Bot,
  reasoning: Brain,
  creative: Lightbulb,
  learning: Sparkles,
};

const agentNames = {
  coordinator: 'Coordinator',
  reasoning: 'Reasoning Agent',
  creative: 'Creative Agent',
  learning: 'Learning Agent',
};

export function TypingIndicator({ agentType = 'coordinator', estimatedTime }: TypingIndicatorProps) {
  const Icon = agentIcons[agentType];
  const name = agentNames[agentType];

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg max-w-xs">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-5 w-5 text-primary" />
      </motion.div>
      
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{name} is thinking...</div>
        {estimatedTime && (
          <div className="text-xs text-muted-foreground">
            Usually responds in {estimatedTime}s
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
