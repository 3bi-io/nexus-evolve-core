import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// ============================================
// UNIFIED RESPONSIVE & MOBILE HOOK
// Consolidates: use-mobile.tsx, useMobile.ts, useResponsive.ts
// ============================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';
export type Platform = 'ios' | 'android' | 'web';

export interface ResponsiveState {
  // Breakpoint info
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
  orientation: Orientation;
  isTouchDevice: boolean;
  
  // Sub-mobile breakpoints
  isSmallMobile: boolean;  // < 375px
  isMediumMobile: boolean; // 375-428px
  isLargeMobile: boolean;  // > 428px
  
  // Native/Platform info (from useMobile.ts)
  isNative: boolean;
  platform: Platform;
  isOled: boolean;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
  smallMobile: 375,
  largeMobile: 428,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.wide) return 'desktop';
  return 'wide';
}

function getResponsiveState(): ResponsiveState {
  if (typeof window === 'undefined') {
    return {
      breakpoint: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
      width: 1920,
      height: 1080,
      orientation: 'landscape',
      isTouchDevice: false,
      isSmallMobile: false,
      isMediumMobile: false,
      isLargeMobile: false,
      isNative: false,
      platform: 'web',
      isOled: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < BREAKPOINTS.mobile;
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as Platform;
  
  // OLED mode check
  const hasOledSupport = isMobile && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const oledEnabled = localStorage.getItem('oled-mode') === 'true';

  return {
    breakpoint: getBreakpoint(width),
    isMobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.wide,
    isWide: width >= BREAKPOINTS.wide,
    width,
    height,
    orientation: height > width ? 'portrait' : 'landscape',
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isSmallMobile: width < BREAKPOINTS.smallMobile,
    isMediumMobile: width >= BREAKPOINTS.smallMobile && width <= BREAKPOINTS.largeMobile,
    isLargeMobile: width > BREAKPOINTS.largeMobile && width < BREAKPOINTS.mobile,
    isNative,
    platform,
    isOled: hasOledSupport && oledEnabled,
  };
}

/**
 * Unified responsive hook - the single source of truth for all responsive/mobile state
 * Combines functionality from: use-mobile.tsx, useMobile.ts, useResponsive.ts
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(getResponsiveState);

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Configure status bar for native apps
  useEffect(() => {
    if (state.isNative) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      if (state.platform === 'android') {
        StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
      }
    }
  }, [state.isNative, state.platform]);

  return state;
}

// ============================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================

/**
 * @deprecated Use useResponsive().isMobile instead
 * Kept for backward compatibility with use-mobile.tsx imports
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * @deprecated Use useResponsive() instead
 * Kept for backward compatibility with useMobile.ts imports
 */
export function useMobile() {
  const { isMobile, isNative, platform, isOled } = useResponsive();
  return { isMobile, isNative, platform, isOled };
}

// ============================================
// UTILITY HOOKS
// ============================================

/** Check for specific breakpoint */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { breakpoint: current } = useResponsive();
  return current === breakpoint;
}

/** Check for minimum breakpoint */
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

// ============================================
// KEYBOARD HOOK (from useMobile.ts)
// ============================================

export function useKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { isNative } = useResponsive();

  useEffect(() => {
    if (!isNative) return;

    let showListener: { remove: () => void } | null = null;
    let hideListener: { remove: () => void } | null = null;

    const setupListeners = async () => {
      try {
        showListener = await Keyboard.addListener('keyboardWillShow', () => {
          setIsKeyboardVisible(true);
        });

        hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setIsKeyboardVisible(false);
        });
      } catch (e) {
        // Keyboard plugin not available
      }
    };

    setupListeners();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, [isNative]);

  return { isKeyboardVisible };
}

// ============================================
// HAPTICS HOOK (from useMobile.ts)
// ============================================

export function useHaptics() {
  const { isNative } = useResponsive();

  const light = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  const medium = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {}
    }
  };

  const heavy = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (e) {}
    }
  };

  const selection = async () => {
    if (isNative) {
      try {
        await Haptics.selectionStart();
      } catch (e) {}
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative) {
      try {
        const typeMap: Record<string, NotificationType> = {
          success: NotificationType.Success,
          warning: NotificationType.Warning,
          error: NotificationType.Error,
        };
        await Haptics.notification({ type: typeMap[type] });
      } catch (e) {}
    }
  };

  return { light, medium, heavy, selection, notification };
}

// Export breakpoints for external use
export { BREAKPOINTS };
