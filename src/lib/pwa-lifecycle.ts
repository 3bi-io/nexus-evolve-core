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
    onNeedRefresh() {
      console.info('🔄 PWA: Update available');
      toast('Update available', {
        description: 'A new version is available. Click to update.',
        action: {
          label: 'Update now',
          onClick: () => {
            console.info('⏫ PWA: User triggered update');
            updateSW(true);
            window.location.reload();
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
    },
    onRegisterError(error) {
      console.error('❌ PWA: Service Worker registration failed', error);
    },
  });

  return updateSW;
}
