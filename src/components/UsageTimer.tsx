import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientIP } from "@/hooks/useClientIP";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const SECONDS_PER_CREDIT = 300; // 5 minutes

export const UsageTimer = () => {
  const { user } = useAuth();
  const { ipAddress } = useClientIP();
  const location = useLocation();
  const { toast } = useToast();
  
  const [usageSessionId, setUsageSessionId] = useState<string | null>(() => {
    // Try to recover session from sessionStorage
    return sessionStorage.getItem('usage_session_id');
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const saved = sessionStorage.getItem('usage_elapsed_seconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only run timer on specific routes where AI is being used
  const shouldRunTimer = ['/chat', '/problem-solver', '/knowledge-graph'].includes(location.pathname);

  // Start or recover session on mount
  useEffect(() => {
    if (!shouldRunTimer) return;

    const startOrRecoverSession = async () => {
      // Try to recover existing session first
      const savedSessionId = sessionStorage.getItem('usage_session_id');
      
      if (savedSessionId) {
        try {
          const { data, error } = await supabase.functions.invoke('manage-usage-session', {
            body: { 
              action: 'check',
              usageSessionId: savedSessionId
            }
          });

          if (!error && data.isActive) {
            setUsageSessionId(savedSessionId);
            setRemainingSeconds(data.remainingSeconds);
            setElapsedSeconds(data.elapsedSeconds || 0);
            setIsActive(true);
            return;
          }
        } catch (error) {
          console.log('Could not recover session, starting new one');
        }
      }

      // Start new session if recovery failed or no saved session
      try {
        const { data, error } = await supabase.functions.invoke('manage-usage-session', {
          body: {
            action: 'start',
            userId: user?.id,
            ipAddress: ipAddress
          }
        });

        if (error) throw error;

        if (data.allowed) {
          setUsageSessionId(data.sessionId);
          setRemainingSeconds(data.remainingSeconds);
          setIsActive(true);
          setErrorMessage(null);
          
          // Persist session ID
          sessionStorage.setItem('usage_session_id', data.sessionId);
        } else {
          setErrorMessage("You've used all your available time credits. Please upgrade your plan to continue.");
          toast({
            title: "No credits available",
            description: "Please upgrade your plan to continue using the service.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Failed to start session:', error);
        setErrorMessage("Failed to start usage session. Please refresh the page.");
      }
    };

    if ((user || ipAddress) && !usageSessionId) {
      startOrRecoverSession();
    }
  }, [user, ipAddress, shouldRunTimer]);

  // Update timer every second with persistence
  useEffect(() => {
    if (!isActive || !usageSessionId) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const newElapsed = prev + 1;
        sessionStorage.setItem('usage_elapsed_seconds', newElapsed.toString());
        return newElapsed;
      });
      setRemainingSeconds(prev => {
        const newRemaining = Math.max(0, prev - 1);
        
        // Show warning at 60 seconds (1 minute) remaining
        if (newRemaining === 60 && !showWarning) {
          setShowWarning(true);
          toast({
            title: "⏰ 1 minute remaining",
            description: "Your session will end soon. Save your work!",
            duration: 10000,
          });
        }

        // Stop session when time runs out
        if (newRemaining === 0) {
          stopSession();
        }

        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, usageSessionId, showWarning]);

  const stopSession = useCallback(async () => {
    if (!usageSessionId) return;

    try {
      await supabase.functions.invoke('manage-usage-session', {
        body: {
          action: 'stop',
          usageSessionId
        }
      });

      setIsActive(false);
      
      // Clear session storage
      sessionStorage.removeItem('usage_session_id');
      sessionStorage.removeItem('usage_elapsed_seconds');
      
      if (remainingSeconds === 0) {
        toast({
          title: "Session ended",
          description: "You've run out of time. Please add more credits to continue.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  }, [usageSessionId, remainingSeconds]);

  // Stop session on unmount
  useEffect(() => {
    return () => {
      if (isActive && usageSessionId) {
        stopSession();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    const percentage = (remainingSeconds / (SECONDS_PER_CREDIT)) * 100;
    if (percentage > 50) return "text-success";
    if (percentage > 20) return "text-warning";
    return "text-destructive";
  };

  const progressPercentage = Math.min(100, (remainingSeconds / SECONDS_PER_CREDIT) * 100);

  // Show error state if there's an error message
  if (errorMessage && shouldRunTimer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <Alert variant="destructive" className="max-w-md flex items-start gap-2 p-4">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Session Error</p>
            <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
          </div>
        </Alert>
      </motion.div>
    );
  }

  if (!isActive || !shouldRunTimer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 right-4 z-50"
    >
      <Badge 
        variant="secondary" 
        className="px-4 py-3 gap-2 bg-card/95 border shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {remainingSeconds <= 60 ? (
              <motion.div
                key="warning"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
              </motion.div>
            ) : (
              <motion.div
                key="clock"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <Clock className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Time left</span>
              <span className={`text-sm font-bold ${getColorClass()}`}>
                {formatTime(remainingSeconds)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        </div>
      </Badge>
    </motion.div>
  );
};
