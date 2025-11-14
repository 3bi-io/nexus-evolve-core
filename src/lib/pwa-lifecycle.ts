import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

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

  // Normal PWA registration with lifecycle hooks
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.info('🔄 PWA: Update available');
      
      // Store that an update is available
      localStorage.setItem('pwa-update-available', 'true');
      
      toast('New version available', {
        description: 'Click to update and get the latest features.',
        action: {
          label: 'Update now',
          onClick: () => {
            console.info('⏫ PWA: User triggered update');
            localStorage.removeItem('pwa-update-available');
            updateSW(true);
            // Force a hard reload after update
            setTimeout(() => {
              window.location.reload();
            }, 100);
          },
        },
        cancel: {
          label: 'Later',
          onClick: () => {},
        },
        duration: Infinity,
      });
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
