import { useEffect, useRef } from 'react';
import { useHaptics } from '@/hooks/useMobile';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  edgeSwipe?: boolean; // Only trigger from screen edges
  edgeThreshold?: number; // How far from edge to consider it an edge swipe
}

export function useSwipeGestures(options: SwipeGestureOptions) {
  const { threshold = 50, edgeSwipe = false, edgeThreshold = 50 } = options;
  const { light } = useHaptics();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      
      // If edge swipe is enabled, only start tracking if touch is near edge
      if (edgeSwipe) {
        const isNearLeftEdge = touch.clientX < edgeThreshold;
        const isNearRightEdge = touch.clientX > window.innerWidth - edgeThreshold;
        
        if (!isNearLeftEdge && !isNearRightEdge) {
          return; // Ignore touches not near edges
        }
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          light();
          if (deltaX > 0) {
            options.onSwipeRight?.();
          } else {
            options.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          light();
          if (deltaY > 0) {
            options.onSwipeDown?.();
          } else {
            options.onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [options, threshold, edgeSwipe, edgeThreshold, light]);

  return null;
}
