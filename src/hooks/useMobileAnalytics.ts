/**
 * @deprecated Use useAnalytics instead
 * This file is kept for backward compatibility
 */
import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';
import { useMobile } from './useResponsive';

export function useMobileAnalytics() {
  const { isMobile } = useMobile();
  const { trackGesture, trackOfflineUsage } = useAnalytics();

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
    trackGesture: (gestureType: string, target?: string) => {
      if (isMobile) {
        trackGesture(gestureType, target);
      }
    },
    trackOfflineUsage: (duration: number) => {
      if (isMobile) {
        trackOfflineUsage(duration);
      }
    },
  };
}
