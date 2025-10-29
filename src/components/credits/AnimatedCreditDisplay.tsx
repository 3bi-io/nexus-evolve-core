import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnimatedCreditDisplayProps {
  credits: number;
  onCreditDeduct?: () => void;
}

export function AnimatedCreditDisplay({ credits, onCreditDeduct }: AnimatedCreditDisplayProps) {
  const [prevCredits, setPrevCredits] = useState(credits);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (credits < prevCredits) {
      setShowParticles(true);
      onCreditDeduct?.();
      setTimeout(() => setShowParticles(false), 1000);
    }
    setPrevCredits(credits);
  }, [credits, prevCredits, onCreditDeduct]);

  const getColorClass = () => {
    if (credits > 20) return 'text-success';
    if (credits >= 5) return 'text-warning';
    return 'text-destructive';
  };

  const getUrgencyMessage = () => {
    if (credits === 0) return 'Out of credits';
    if (credits <= 2) return 'Almost out!';
    if (credits <= 5) return 'Running low';
    return null;
  };

  return (
    <div className="relative">
      <Card className="p-3 flex items-center gap-3 bg-card/50 backdrop-blur-sm">
        <div className="relative">
          <Coins className={`h-5 w-5 ${getColorClass()}`} />
          <AnimatePresence>
            {showParticles && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-0 left-0 w-1 h-1 rounded-full bg-primary"
                    initial={{ opacity: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      x: (Math.random() - 0.5) * 40,
                      y: (Math.random() - 0.5) * 40,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <motion.span
              key={credits}
              className={`text-lg font-bold ${getColorClass()}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {credits}
            </motion.span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
          
          {getUrgencyMessage() && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-xs text-destructive"
            >
              <TrendingDown className="h-3 w-3" />
              {getUrgencyMessage()}
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              credits > 20 ? 'bg-success' : credits >= 5 ? 'bg-warning' : 'bg-destructive'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </Card>
    </div>
  );
}
