import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientIP } from "@/hooks/useClientIP";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const SECONDS_PER_CREDIT = 300; // 5 minutes
const TIMER_ROUTES = ['/chat', '/problem-solver', '/knowledge-graph'];

export const UsageTimer = () => {
  const { user } = useAuth();
  const { ipAddress, loading: ipLoading } = useClientIP();
  const location = useLocation();
  const { toast } = useToast();
  
  const [usageSessionId, setUsageSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Determine if timer should run on current route
  const shouldRunTimer = TIMER_ROUTES.includes(location.pathname);

  // Clear session state when navigating away from timer routes
  useEffect(() => {
    if (!shouldRunTimer) {
      // Clean up session state
      if (usageSessionId && isActive) {
        stopSession();
      }
      setUsageSessionId(null);
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      setIsActive(false);
      setShowWarning(false);
      sessionStorage.removeItem('usage_session_id');
      sessionStorage.removeItem('usage_elapsed_seconds');
    }
  }, [shouldRunTimer]);

  // Initialize session when on timer route
  useEffect(() => {
    if (!shouldRunTimer) return;
    if (usageSessionId) return; // Already have a session
    
    // Wait for IP to load for anonymous users
    if (!user && ipLoading) {
      console.log('Waiting for IP address to load...');
      return;
    }

    const startSession = async () => {
      try {
        console.log('Starting usage session...', { user: !!user, ipAddress, route: location.pathname });
        
        const { data, error } = await supabase.functions.invoke('manage-usage-session', {
          body: {
            action: 'start',
            userId: user?.id,
            ipAddress: ipAddress || undefined,
            route: location.pathname
          }
        });

        if (error) {
          console.error('Session start error:', error);
          // Silently fail for anonymous users without IP
          if (!user && !ipAddress) {
            console.log('Anonymous user without IP, skipping session tracking');
            return;
          }
          throw error;
        }

        if (data.allowed) {
          console.log('Session started successfully:', data.sessionId);
          setUsageSessionId(data.sessionId);
          setRemainingSeconds(data.remainingSeconds || 0);
          setIsActive(true);
          sessionStorage.setItem('usage_session_id', data.sessionId);
        } else {
          toast({
            title: "No credits available",
            description: "Please upgrade your plan to continue using the service.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Failed to start session:', error);
        // Only show error for authenticated users or when IP is available
        if (user || ipAddress) {
          toast({
            title: "Session Error",
            description: "Could not start usage tracking. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    };

    // Only start if we have user OR ipAddress
    if (user || ipAddress) {
      startSession();
    }
  }, [shouldRunTimer, user, ipAddress, ipLoading, usageSessionId, location.pathname]);

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

  // Only render if active and on a timer route
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
