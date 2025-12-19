import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMobile } from "@/hooks/useResponsive";
import { motion } from "framer-motion";
import { SafeAnimatePresence } from "@/components/ui/SafeAnimatePresence";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { isMobile, isNative } = useMobile();

  useEffect(() => {
    // Don't show if already installed or running as native app
    if (isNative) return;

    // Check if reminded later (24 hours)
    const remindLater = localStorage.getItem('pwa-install-remind-later');
    if (remindLater) {
      const remindTime = parseInt(remindLater);
      if (Date.now() < remindTime) return;
      localStorage.removeItem('pwa-install-remind-later');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isNative]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Remind after 24 hours
    const remindTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-remind-later', remindTime.toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remind after 7 days
    const remindTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-remind-later', remindTime.toString());
  };

  if (!showPrompt || !deferredPrompt || !isMobile) return null;

  return (
    <SafeAnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
      >
        <Card className="p-4 bg-card/95 backdrop-blur-lg border-primary/20 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install Oneiros.me</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get instant access, offline support, and native-like speed. Join thousands of users!
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1"
                >
                  Install Now
                </Button>
                <Button
                  onClick={handleRemindLater}
                  size="sm"
                  variant="ghost"
                >
                  Later
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </motion.div>
    </SafeAnimatePresence>
  );
}
