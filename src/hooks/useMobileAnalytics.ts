import { useEffect, useCallback } from 'react';
import { MobileAnalytics } from '@/lib/mobile-analytics';
import { useMobile } from './useResponsive';

export function useMobileAnalytics() {
  const { isMobile } = useMobile();

  const trackGesture = useCallback((gestureType: string, target?: string) => {
    if (isMobile) {
      MobileAnalytics.trackGesture(gestureType, target);
    }
  }, [isMobile]);

  const trackOfflineUsage = useCallback((duration: number) => {
    if (isMobile) {
      MobileAnalytics.trackOfflineUsage(duration);
    }
  }, [isMobile]);

  // Track offline/online transitions
  useEffect(() => {
    if (!isMobile) return;

    let offlineStart: number | null = null;

    const handleOffline = () => {
      offlineStart = Date.now();
    };

    const handleOnline = () => {
      if (offlineStart) {
        const duration = Date.now() - offlineStart;
        trackOfflineUsage(duration);
        offlineStart = null;
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [isMobile, trackOfflineUsage]);

  return {
    trackGesture,
    trackOfflineUsage,
  };
}
