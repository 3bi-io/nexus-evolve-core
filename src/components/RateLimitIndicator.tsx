import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateLimitIndicatorProps {
  currentCount?: number;
  limit?: number;
  resetAt?: Date;
  show?: boolean;
}

export function RateLimitIndicator({ 
  currentCount = 0, 
  limit = 100, 
  resetAt,
  show = false 
}: RateLimitIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const percentage = (currentCount / limit) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  useEffect(() => {
    if (!resetAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const reset = new Date(resetAt).getTime();
      const diff = reset - now;

      if (diff <= 0) {
        setTimeRemaining('Resetting...');
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetAt]);

  if (!show && !isNearLimit) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant={isAtLimit ? "destructive" : isNearLimit ? "default" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {isAtLimit ? 'Rate Limit Reached' : 'Approaching Rate Limit'}
              </span>
              {resetAt && (
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  Resets in {timeRemaining}
                </span>
              )}
            </div>
            <Progress 
              value={percentage} 
              className="h-2" 
            />
            <p className="text-xs">
              {currentCount} / {limit} requests used
              {isAtLimit 
                ? '. Please wait for the limit to reset.' 
                : '. Consider slowing down your requests.'}
            </p>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}