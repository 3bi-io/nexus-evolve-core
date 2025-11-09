import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SafeAnimatePresence } from '@/components/ui/SafeAnimatePresence';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';

export function StickySignupCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useMobile();

  useEffect(() => {
    if (user || !isMobile || isDismissed) return;

    const handleScroll = () => {
      // Show after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    // Show after 3 seconds on mobile
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [user, isMobile, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isMobile || user || isDismissed) return null;

  return (
    <SafeAnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-20 left-4 right-4 z-50 safe-bottom"
        >
          <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-2xl shadow-2xl relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 backdrop-blur-sm"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  Get 500 Daily AI Interactions
                </p>
                <p className="text-white/80 text-xs">
                  Join beta for free forever
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </SafeAnimatePresence>
  );
}
