import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-tracks page views and feature usage for analytics
 * Usage: Add to layout components or individual pages
 * 
 * @param pageTitle - Optional page title for better tracking
 */
export function usePageAnalytics(pageTitle?: string) {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const trackPageView = async () => {
      try {
        await supabase.from('user_events').insert({
          user_id: user.id,
          event_type: 'page_view',
          event_data: {
            page_url: location.pathname,
            page_title: pageTitle || document.title,
            search: location.search,
            hash: location.hash,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
          },
          page_url: location.pathname,
        });
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname, location.search, user, pageTitle]);
}

/**
 * Track custom events for user actions
 * 
 * @example
 * const { trackEvent } = useEventTracking();
 * trackEvent('button_click', { button_name: 'upgrade' });
 */
export function useEventTracking() {
  const { user } = useAuth();
  const location = useLocation();

  const trackEvent = async (eventType: string, eventData?: Record<string, any>) => {
    if (!user) return;

    try {
      await supabase.from('user_events').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: {
          ...eventData,
          page_url: location.pathname,
          timestamp: new Date().toISOString(),
        },
        page_url: location.pathname,
      });
    } catch (error) {
      console.debug('Event tracking failed:', error);
    }
  };

  return { trackEvent };
}
