import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import { initIdleDetection } from './idle-detection';

interface UpdateState {
  updateAvailable: boolean;
  updateFunction: ((reloadPage?: boolean) => Promise<void>) | null;
  downloadStarted: boolean;
  idlePromptShown: boolean;
}

export function initPWA() {
  // Check user preference first
  const pwaEnabled = localStorage.getItem('pwa-enabled');
  const userDisabledPWA = pwaEnabled === 'false';
  
  // Emergency bypass: ?no-sw=1 skips SW registration entirely
  const urlParams = new URLSearchParams(window.location.search);
  const noSW = urlParams.has('no-sw');
  
  // Skip if user has disabled PWA in settings or no-sw param is present
  if (userDisabledPWA || noSW) {
    const reason = userDisabledPWA ? 'disabled in settings' : 'no-sw parameter';
    console.info(`🚨 PWA: Service worker disabled (${reason})`);
    
    if (userDisabledPWA) {
      toast.info('PWA disabled', {
        description: 'Service worker is turned off in account settings',
      });
    }

    // Best-effort cleanup of any existing SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
          console.info(`🧹 PWA: Unregistered existing SW (${reason})`);
        });
      });
    }

    return () => {}; // Return no-op function
  }

  // Track update state
  const updateState: UpdateState = {
    updateAvailable: false,
    updateFunction: null,
    downloadStarted: false,
    idlePromptShown: false,
  };

  // Initialize idle detection
  const idleDetector = initIdleDetection({
    idleThreshold: 30000, // 30 seconds of inactivity
    onIdleStart: () => {
      console.info('🛋️ PWA: User is idle');
      
      // If update is available and we haven't shown the idle prompt yet
      if (updateState.updateAvailable && !updateState.idlePromptShown) {
        showIdleUpdatePrompt(updateState);
      }
    },
  });

  // Normal PWA registration with lifecycle hooks
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.info('🔄 PWA: Update available - starting silent download');
      
      // Store that an update is available
      localStorage.setItem('pwa-update-available', 'true');
      
      // Mark update as available
      updateState.updateAvailable = true;
      updateState.updateFunction = updateSW;
      updateState.downloadStarted = true;
      
      // Show subtle notification that update is downloading
      toast.info('Downloading update in background', {
        description: 'You\'ll be notified when ready to install.',
        duration: 3000,
      });
      
      // Check if user is already idle
      if (idleDetector.isCurrentlyIdle() && !updateState.idlePromptShown) {
        // Wait a bit before showing prompt (let them see the download toast first)
        setTimeout(() => {
          if (idleDetector.isCurrentlyIdle()) {
            showIdleUpdatePrompt(updateState);
          }
        }, 5000);
      }
    },
    onOfflineReady() {
      console.info('✅ PWA: App ready for offline use');
      toast.success('App is ready for offline use');
    },
    onRegisteredSW(swUrl, registration) {
      console.info('✅ PWA: Service Worker registered', { swUrl, registration });
      
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          registration.update().catch((err) => {
            console.error('Failed to check for updates:', err);
          });
        }, 60000);
      }
    },
    onRegisterError(error) {
      console.error('❌ PWA: Service Worker registration failed', error);
      
      // Log error for tracking
      localStorage.setItem('pwa-registration-error', JSON.stringify({
        message: error.message,
        timestamp: new Date().toISOString(),
      }));
      
      toast.error('App initialization issue', {
        description: 'Try refreshing the page or clearing your cache.',
        action: {
          label: 'Clear Cache',
          onClick: () => {
            window.location.href = '/clear-cache';
          },
        },
      });
    },
  });

  return updateSW;
}

/**
 * Show idle update prompt - less intrusive notification when user is idle
 */
function showIdleUpdatePrompt(updateState: UpdateState) {
  if (updateState.idlePromptShown || !updateState.updateFunction) return;
  
  updateState.idlePromptShown = true;
  console.info('💤 PWA: Showing idle update prompt');
  
  toast.success('Update ready to install', {
    description: 'A new version is downloaded. Refresh to apply the update.',
    action: {
      label: 'Refresh now',
      onClick: () => {
        console.info('⏫ PWA: User accepted idle update');
        localStorage.removeItem('pwa-update-available');
        updateState.updateFunction?.(true);
        
        // Show loading state
        toast.loading('Applying update...', { duration: 1000 });
        
        // Force reload after brief delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
    },
    cancel: {
      label: 'Later',
      onClick: () => {
        console.info('⏸️ PWA: User postponed idle update');
        // Reset flag so we can show again next time they're idle
        updateState.idlePromptShown = false;
      },
    },
    duration: 10000, // Auto-dismiss after 10 seconds
  });
}
