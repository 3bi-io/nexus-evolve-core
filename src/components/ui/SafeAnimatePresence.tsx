import { AnimatePresence } from 'framer-motion';
import { ReactNode, Fragment } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SafeAnimatePresenceProps {
  children: ReactNode;
  mode?: "sync" | "wait" | "popLayout";
  disableOnMobile?: boolean;
}

/**
 * Safe wrapper around framer-motion's AnimatePresence that prevents
 * "Object.entries requires that input parameter not be null or undefined" errors
 * by optionally disabling animations on mobile devices where timing issues are more common.
 * 
 * Features:
 * - Validates children before passing to AnimatePresence
 * - Disables animations on mobile by default for better performance
 * - Wraps children in Fragment for safety
 * - Development warnings for debugging
 */
export const SafeAnimatePresence = ({ 
  children, 
  mode,
  disableOnMobile = true 
}: SafeAnimatePresenceProps) => {
  const isMobile = useIsMobile();
  
  // Development warning with stack trace for null/undefined children
  if (process.env.NODE_ENV === 'development') {
    if (children === null || children === undefined) {
      console.warn(
        '[SafeAnimatePresence] Received null/undefined children - this may cause errors',
        '\nComponent stack:', new Error().stack
      );
    }
  }
  
  // On mobile, skip AnimatePresence to avoid timing/null children issues
  if (disableOnMobile && isMobile) {
    return <Fragment>{children}</Fragment>;
  }
  
  // Ensure we always have valid children
  if (children === null || children === undefined) {
    return null;
  }
  
  return <AnimatePresence mode={mode}><Fragment>{children}</Fragment></AnimatePresence>;
};
