import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { MobileAnalytics } from '@/lib/mobile-analytics';

interface EngagementMetrics {
  messagesCount: number;
  sessionDuration: number;
  lastMessageTime: number | null;
  consecutiveDays: number;
}

/**
 * Unified Analytics Hook
 * Consolidates useAnalytics, useEngagementTracking, and useMobileAnalytics
 */
export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Engagement metrics state
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    messagesCount: 0,
    sessionDuration: 0,
    lastMessageTime: null,
    consecutiveDays: 1,
  });

  // Track page views
  useEffect(() => {
    if (user) {
      trackEvent('page_view', {
        page_url: location.pathname,
      });
    }
  }, [location.pathname, user]);

  // Session duration tracking
  useEffect(() => {
    const storageKey = user ? `engagement_${user.id}` : 'engagement_anonymous';
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setEngagementMetrics(data);
      } catch {
        // Ignore invalid stored data
      }
    }

    const sessionStart = Date.now();
    
    const interval = setInterval(() => {
      setEngagementMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Track general events
  const trackEvent = useCallback(
    async (eventType: string, eventData?: Record<string, any>) => {
      if (!user) return;

      try {
        await supabase.from('user_events').insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData || {},
          page_url: location.pathname,
        });
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    },
    [user, location.pathname]
  );

  // Track feature usage
  const trackFeatureUsage = useCallback(
    async (featureName: string) => {
      if (!user) return;

      try {
        const { data: existing } = await supabase
          .from('feature_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('feature_name', featureName)
          .single();

        if (existing) {
          await supabase
            .from('feature_usage')
            .update({
              usage_count: existing.usage_count + 1,
              last_used_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('feature_usage').insert({
            user_id: user.id,
            feature_name: featureName,
            usage_count: 1,
          });
        }
      } catch (error) {
        console.error('Failed to track feature usage:', error);
      }
    },
    [user]
  );

  // Track message for engagement
  const trackMessage = useCallback(() => {
    const storageKey = user ? `engagement_${user.id}` : 'engagement_anonymous';
    const newMetrics = {
      ...engagementMetrics,
      messagesCount: engagementMetrics.messagesCount + 1,
      lastMessageTime: Date.now(),
    };
    
    setEngagementMetrics(newMetrics);
    localStorage.setItem(storageKey, JSON.stringify(newMetrics));
  }, [user, engagementMetrics]);

  // Check if should show upgrade prompt
  const shouldShowUpgradePrompt = useCallback((): {
    show: boolean;
    trigger: 'credits_low' | 'session_value' | 'time_based' | null;
  } => {
    if (engagementMetrics.messagesCount === 3) {
      return { show: true, trigger: 'session_value' };
    }

    if (engagementMetrics.sessionDuration > 300 && engagementMetrics.messagesCount >= 2) {
      return { show: true, trigger: 'time_based' };
    }

    return { show: false, trigger: null };
  }, [engagementMetrics]);

  // Mobile-specific tracking
  const trackGesture = useCallback((gestureType: string, target?: string) => {
    MobileAnalytics.trackGesture(gestureType, target);
  }, []);

  const trackOfflineUsage = useCallback((duration: number) => {
    MobileAnalytics.trackOfflineUsage(duration);
  }, []);

  return {
    // Core analytics
    trackEvent,
    trackFeatureUsage,
    
    // Engagement tracking
    engagementMetrics,
    trackMessage,
    shouldShowUpgradePrompt,
    
    // Mobile tracking
    trackGesture,
    trackOfflineUsage,
  };
}

// Re-export for backward compatibility
export { useAnalytics as useEngagementTracking };
