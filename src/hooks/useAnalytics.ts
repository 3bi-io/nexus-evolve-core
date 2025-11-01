import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (user) {
      trackEvent('page_view', {
        page_url: location.pathname,
      });
    }
  }, [location.pathname, user]);

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

  const trackFeatureUsage = useCallback(
    async (featureName: string) => {
      if (!user) return;

      try {
        // Check if feature usage exists
        const { data: existing } = await supabase
          .from('feature_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('feature_name', featureName)
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from('feature_usage')
            .update({
              usage_count: existing.usage_count + 1,
              last_used_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Create new
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

  return {
    trackEvent,
    trackFeatureUsage,
  };
}
