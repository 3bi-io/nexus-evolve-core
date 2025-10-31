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
  const [isStarting, setIsStarting] = useState(false);

  // Start session for all users (authenticated and anonymous)
  useEffect(() => {
    if (usageSessionId || isStarting) {
      console.log('[UsageTimer] Session already exists or starting, skipping:', { usageSessionId, isStarting });
      return;
    }

    const startSession = async () => {
      setIsStarting(true);
      console.log('[UsageTimer] === Starting Session Flow ===');
      console.log('[UsageTimer] User authenticated:', !!user);
      console.log('[UsageTimer] User ID:', user?.id);
      
      try {
        const requestBody: any = { action: 'start' };
        
        if (user) {
          requestBody.userId = user.id;
          console.log('[UsageTimer] Building request for authenticated user:', user.id);
        } else {
          // Anonymous visitor - get IP from client
          requestBody.ipAddress = 'client'; // Backend will extract real IP
          console.log('[UsageTimer] Building request for anonymous visitor');
        }
        
        console.log('[UsageTimer] Request body:', JSON.stringify(requestBody, null, 2));
        console.log('[UsageTimer] Invoking manage-usage-session edge function...');
        
        const { data, error } = await supabase.functions.invoke('manage-usage-session', {
          body: requestBody
        });

        console.log('[UsageTimer] === Response Received ===');
        console.log('[UsageTimer] Data:', JSON.stringify(data, null, 2));
        console.log('[UsageTimer] Error:', error);

        if (error) {
          console.error('[UsageTimer] ❌ Session start error:', error);
          console.error('[UsageTimer] Error details:', JSON.stringify(error, null, 2));
          throw error;
        }

        if (data?.success && data?.sessionId) {
          console.log('[UsageTimer] ✅ Session started successfully');
          console.log('[UsageTimer] Session ID:', data.sessionId);
          console.log('[UsageTimer] Remaining seconds:', data.remainingSeconds);
          console.log('[UsageTimer] Remaining credits:', data.remainingCredits);
          
          setUsageSessionId(data.sessionId);
          setRemainingSeconds(data.remainingSeconds || SESSION_DURATION_SECONDS);
          setIsActive(true);
          sessionStorage.setItem('usageSessionId', data.sessionId);
          sessionStorage.setItem('sessionStartTime', Date.now().toString());
          
          console.log('[UsageTimer] State updated, timer is now active');
        } else if (!data?.success) {
          console.error('[UsageTimer] ❌ Session start failed');
          console.error('[UsageTimer] Failure message:', data?.message);
          console.error('[UsageTimer] Full response:', JSON.stringify(data, null, 2));
          toast.error(data?.message || "Failed to start session");
        } else {
          console.warn('[UsageTimer] ⚠️ Unexpected response format:', data);
        }
      } catch (error: any) {
        console.error('[UsageTimer] ❌ Exception during session start:', error);
        console.error('[UsageTimer] Error stack:', error?.stack);
        console.error('[UsageTimer] Error message:', error?.message);
        toast.error("Failed to start usage session");
      } finally {
        setIsStarting(false);
      }
      
      console.log('[UsageTimer] === Session Flow Complete ===');
    };

    console.log('[UsageTimer] Triggering session start...');
    startSession();
  }, [user, usageSessionId, isStarting]);

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
    if (!usageSessionId) {
      console.log('[UsageTimer] No session ID to stop');
      return;
    }

    console.log('[UsageTimer] === Stopping Session ===');
    console.log('[UsageTimer] Session ID:', usageSessionId);
    console.log('[UsageTimer] Elapsed seconds:', elapsedSeconds);

    try {
      const stopBody = { 
        action: 'stop', 
        sessionId: usageSessionId,
        userId: user?.id 
      };
      
      console.log('[UsageTimer] Stop request body:', JSON.stringify(stopBody, null, 2));
      
      const { data, error } = await supabase.functions.invoke('manage-usage-session', {
        body: stopBody
      });

      console.log('[UsageTimer] Stop response:', { data, error });

      if (error) {
        console.error('[UsageTimer] ❌ Error stopping session:', error);
        throw error;
      }

      sessionStorage.removeItem('usageSessionId');
      sessionStorage.removeItem('sessionStartTime');
      sessionStorage.removeItem('elapsedSeconds');
      
      setUsageSessionId(null);
      setIsActive(false);
      setElapsedSeconds(0);
      setRemainingSeconds(SESSION_DURATION_SECONDS);

      if (data?.success) {
        console.log('[UsageTimer] ✅ Session stopped successfully');
        console.log('[UsageTimer] Credits deducted:', data.creditsDeducted);
        toast.info(`Session ended. ${data.creditsDeducted || 0} credits used.`);
      }
    } catch (error: any) {
      console.error('[UsageTimer] ❌ Failed to stop session:', error);
      console.error('[UsageTimer] Error details:', error?.message);
    }
    
    console.log('[UsageTimer] === Session Stop Complete ===');
  }, [usageSessionId, user?.id, elapsedSeconds]);

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
