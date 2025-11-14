import { useEffect, useState } from 'react';
import { getIdleDetection } from '@/lib/idle-detection';

interface UpdateStatus {
  updateAvailable: boolean;
  downloadInProgress: boolean;
  readyToInstall: boolean;
}

/**
 * Hook to track PWA update status and idle state
 * Used to show update notifications at appropriate times
 */
export function useAutoUpdate() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    updateAvailable: false,
    downloadInProgress: false,
    readyToInstall: false,
  });
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    // Check localStorage for update flags
    const checkUpdateStatus = () => {
      const updateAvailable = localStorage.getItem('pwa-update-available') === 'true';
      const downloadInProgress = localStorage.getItem('pwa-download-in-progress') === 'true';
      
      setUpdateStatus({
        updateAvailable,
        downloadInProgress,
        readyToInstall: updateAvailable && !downloadInProgress,
      });
    };

    // Initial check
    checkUpdateStatus();

    // Listen for storage changes (in case another tab updates the flag)
    window.addEventListener('storage', checkUpdateStatus);

    // Check periodically
    const interval = setInterval(checkUpdateStatus, 5000);

    return () => {
      window.removeEventListener('storage', checkUpdateStatus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Track idle state
    const idleDetector = getIdleDetection();
    if (!idleDetector) return;

    const checkIdle = () => {
      setIsIdle(idleDetector.isCurrentlyIdle());
    };

    const interval = setInterval(checkIdle, 3000);
    checkIdle(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const triggerUpdate = () => {
    console.info('🔄 User triggered manual update');
    localStorage.removeItem('pwa-update-available');
    localStorage.removeItem('pwa-download-in-progress');
    window.location.reload();
  };

  const dismissUpdate = () => {
    console.info('⏸️ User dismissed update notification');
    // Don't remove the flag, just close the notification
    // It will show again when they're idle next time
  };

  return {
    updateStatus,
    isIdle,
    triggerUpdate,
    dismissUpdate,
    shouldShowNotification: updateStatus.readyToInstall && isIdle,
  };
}
