import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface EngagementMetrics {
  messagesCount: number;
  sessionDuration: number;
  lastMessageTime: number | null;
  consecutiveDays: number;
}

export function useEngagementTracking() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    messagesCount: 0,
    sessionDuration: 0,
    lastMessageTime: null,
    consecutiveDays: 1,
  });

  useEffect(() => {
    const storageKey = user ? `engagement_${user.id}` : 'engagement_anonymous';
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const data = JSON.parse(stored);
      setMetrics(data);
    }

    // Track session start
    const sessionStart = Date.now();
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const trackMessage = () => {
    const storageKey = user ? `engagement_${user.id}` : 'engagement_anonymous';
    const newMetrics = {
      ...metrics,
      messagesCount: metrics.messagesCount + 1,
      lastMessageTime: Date.now(),
    };
    
    setMetrics(newMetrics);
    localStorage.setItem(storageKey, JSON.stringify(newMetrics));
  };

  const shouldShowUpgradePrompt = (): {
    show: boolean;
    trigger: 'credits_low' | 'session_value' | 'time_based' | null;
  } => {
    // After 3rd message
    if (metrics.messagesCount === 3) {
      return { show: true, trigger: 'session_value' };
    }

    // After 5 minutes of engagement
    if (metrics.sessionDuration > 300 && metrics.messagesCount >= 2) {
      return { show: true, trigger: 'time_based' };
    }

    return { show: false, trigger: null };
  };

  return {
    metrics,
    trackMessage,
    shouldShowUpgradePrompt,
  };
}
