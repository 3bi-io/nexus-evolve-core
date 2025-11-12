import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

export function initPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast('Update available', {
        description: 'A new version is available. Click to update.',
        action: {
          label: 'Update now',
          onClick: () => {
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
      console.log('✅ PWA: App ready for offline use');
      toast.success('App is ready for offline use');
    },
    onRegisteredSW(swUrl, registration) {
      console.log('✅ PWA: Service Worker registered', { swUrl, registration });
    },
    onRegisterError(error) {
      console.error('❌ PWA: Service Worker registration failed', error);
    },
  });

  return updateSW;
}
