import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallStatus } from "@/hooks/useInstallStatus";
import { useMobile } from "@/hooks/useMobile";
import { useNavigate } from "react-router-dom";

export function InstallBadge() {
  const [isMinimized, setIsMinimized] = useState(false);
  const { isInstalled, canPrompt, triggerInstall } = useInstallStatus();
  const { isMobile } = useMobile();
  const navigate = useNavigate();

  // Don't show if installed or not mobile
  if (isInstalled || !isMobile) return null;

  const handleInstallClick = async () => {
    if (canPrompt) {
      await triggerInstall();
    } else {
      navigate('/install');
    }
  };

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-4 z-40 md:hidden"
        >
          <div className="relative">
            <Button
              onClick={handleInstallClick}
              size="lg"
              className="rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90"
            >
              <Download className="w-6 h-6 animate-pulse" />
            </Button>
            
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-md"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
