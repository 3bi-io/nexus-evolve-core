import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Trophy, Sparkles } from 'lucide-react';

interface AchievementToastProps {
  name: string;
  description: string;
  onClose: () => void;
}

export function AchievementToast({ name, description, onClose }: AchievementToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border-primary shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="rounded-full bg-primary/20 p-2"
          >
            <Trophy className="h-6 w-6 text-primary" />
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">Achievement Unlocked!</h3>
            </div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                opacity: 0,
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
