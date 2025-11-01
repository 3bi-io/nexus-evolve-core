import { supabase } from "@/integrations/supabase/client";

export interface MobileEvent {
  event_type: 'app_install' | 'app_open' | 'gesture' | 'offline_usage' | 'performance' | 'crash';
  event_data?: Record<string, any>;
}

export class MobileAnalytics {
  private static sessionStart = Date.now();
  private static isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  static async trackEvent(eventType: MobileEvent['event_type'], eventData?: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const event: MobileEvent = {
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: Date.now(),
          session_duration: Date.now() - this.sessionStart,
          is_standalone: this.isStandalone,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          device_memory: (navigator as any).deviceMemory,
          connection: (navigator as any).connection?.effectiveType,
          user_agent: navigator.userAgent,
        }
      };

      await supabase.from('user_events').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: event.event_data,
        page_url: window.location.pathname,
      });
    } catch (error) {
      console.error('Failed to track mobile event:', error);
    }
  }

  static async trackInstall() {
    await this.trackEvent('app_install', {
      install_source: this.isStandalone ? 'pwa' : 'browser'
    });
  }

  static async trackAppOpen() {
    await this.trackEvent('app_open', {
      referrer: document.referrer,
      is_returning: localStorage.getItem('app_opened_before') === 'true'
    });
    localStorage.setItem('app_opened_before', 'true');
  }

  static async trackGesture(gestureType: string, target?: string) {
    await this.trackEvent('gesture', {
      gesture_type: gestureType,
      target_element: target,
    });
  }

  static async trackOfflineUsage(duration: number) {
    await this.trackEvent('offline_usage', {
      duration_ms: duration,
    });
  }

  static async trackPerformance() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connection: navigation.connectEnd - navigation.connectStart,
      request_time: navigation.responseStart - navigation.requestStart,
      response_time: navigation.responseEnd - navigation.responseStart,
      dom_processing: navigation.domComplete - navigation.domInteractive,
      load_complete: navigation.loadEventEnd - navigation.loadEventStart,
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
    };

    await this.trackEvent('performance', metrics);
  }

  static async trackCrash(error: Error) {
    await this.trackEvent('crash', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
    });
  }

  static setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.trackCrash(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackCrash(new Error(event.reason));
    });
  }

  static trackConnectionChange() {
    const connection = (navigator as any).connection;
    if (!connection) return;

    connection.addEventListener('change', () => {
      this.trackEvent('performance', {
        connection_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        save_data: connection.saveData,
      });
    });
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    MobileAnalytics.trackAppOpen();
    MobileAnalytics.trackPerformance();
    MobileAnalytics.setupGlobalErrorHandler();
    MobileAnalytics.trackConnectionChange();
  });

  // Track install event
  window.addEventListener('appinstalled', () => {
    MobileAnalytics.trackInstall();
  });
}
