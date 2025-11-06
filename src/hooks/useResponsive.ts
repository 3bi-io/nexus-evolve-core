import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
  orientation: Orientation;
  isTouchDevice: boolean;
  isSmallMobile: boolean; // < 375px
  isMediumMobile: boolean; // 375-428px
  isLargeMobile: boolean; // > 428px
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
  smallMobile: 375,
  largeMobile: 428,
} as const;

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
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
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      breakpoint: getBreakpoint(width),
      isMobile: width < BREAKPOINTS.mobile,
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
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        breakpoint: getBreakpoint(width),
        isMobile: width < BREAKPOINTS.mobile,
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
      });
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

  return state;
}

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.wide) return 'desktop';
  return 'wide';
}

// Utility hook for specific breakpoint checks
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { breakpoint: current } = useResponsive();
  return current === breakpoint;
}

// Utility hook for minimum breakpoint
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}
