import { AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
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
 */
export const SafeAnimatePresence = ({ 
  children, 
  mode,
  disableOnMobile = true 
}: SafeAnimatePresenceProps) => {
  const isMobile = useIsMobile();
  
  // On mobile, skip AnimatePresence to avoid timing/null children issues
  if (disableOnMobile && isMobile) {
    return <>{children}</>;
  }
  
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
};
