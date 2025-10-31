import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SESSION_DURATION_SECONDS = 300; // 5 minutes

export const UsageTimer = () => {
  const { user } = useAuth();
  const [usageSessionId, setUsageSessionId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Start session for all users (authenticated and anonymous)
  useEffect(() => {
    if (usageSessionId) return;

    const startSession = async () => {
      try {
        const requestBody: any = { action: 'start' };
        
        if (user) {
          requestBody.userId = user.id;
          console.log('Starting usage session for user:', user.id);
        } else {
          // Anonymous visitor - get IP from client
          requestBody.ipAddress = 'client'; // Backend will extract real IP
          console.log('Starting usage session for anonymous visitor');
        }
        
        const { data, error } = await supabase.functions.invoke('manage-usage-session', {
          body: requestBody
        });

        console.log('Session start response:', { data, error });

        if (error) {
          console.error('Session start error:', error);
          throw error;
        }

        if (data?.success && data?.sessionId) {
          setUsageSessionId(data.sessionId);
          setRemainingSeconds(data.remainingSeconds || SESSION_DURATION_SECONDS);
          setIsActive(true);
          sessionStorage.setItem('usageSessionId', data.sessionId);
          sessionStorage.setItem('sessionStartTime', Date.now().toString());
          console.log('Session started successfully:', data.sessionId);
        } else if (!data?.success) {
          console.error('Session start failed:', data?.message);
          toast.error(data?.message || "Failed to start session");
        }
      } catch (error) {
        console.error('Failed to start usage session:', error);
        toast.error("Failed to start usage session");
      }
    };

    startSession();
  }, [user, usageSessionId]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || !usageSessionId) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const newElapsed = prev + 1;
        sessionStorage.setItem('elapsedSeconds', newElapsed.toString());
        return newElapsed;
      });

      setRemainingSeconds(prev => {
        const newRemaining = prev - 1;
        
        if (newRemaining === 60) {
          toast.warning("60 seconds remaining in your session");
        }
        
        if (newRemaining <= 0) {
          stopSession();
          return 0;
        }
        
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, usageSessionId]);

  // Stop session
  const stopSession = useCallback(async () => {
    if (!usageSessionId) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-usage-session', {
        body: { 
          action: 'stop', 
          sessionId: usageSessionId,
          userId: user?.id 
        }
      });

      if (error) throw error;

      sessionStorage.removeItem('usageSessionId');
      sessionStorage.removeItem('sessionStartTime');
      sessionStorage.removeItem('elapsedSeconds');
      
      setUsageSessionId(null);
      setIsActive(false);
      setElapsedSeconds(0);
      setRemainingSeconds(SESSION_DURATION_SECONDS);

      if (data?.success) {
        toast.info(`Session ended. ${data.creditsDeducted || 0} credits used.`);
      }
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  }, [usageSessionId, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (usageSessionId) {
        stopSession();
      }
    };
  }, [usageSessionId, stopSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (remainingSeconds <= 60) return "text-destructive";
    if (remainingSeconds <= 120) return "text-warning";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (remainingSeconds <= 60) return "[&>div]:bg-destructive";
    if (remainingSeconds <= 120) return "[&>div]:bg-warning";
    return "";
  };

  // Only render when active
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50"
    >
      <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-background/95 backdrop-blur-sm shadow-lg">
        <AnimatePresence mode="wait">
          {remainingSeconds <= 60 ? (
            <motion.div
              key="warning"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              exit={{ scale: 0 }}
            >
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </motion.div>
          ) : (
            <motion.div
              key="clock"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Clock className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-sm font-medium">{formatTime(remainingSeconds)}</span>
        <Progress 
          value={(remainingSeconds / SESSION_DURATION_SECONDS) * 100} 
          className={cn("w-20 h-1.5", getProgressColor())}
        />
      </Badge>
    </motion.div>
  );
};
