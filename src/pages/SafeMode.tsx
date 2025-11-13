import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SafeMode() {
  const [status, setStatus] = useState<'cleaning' | 'redirecting'>('cleaning');

  useEffect(() => {
    const cleanupAndRedirect = async () => {
      try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.info('🧹 SafeMode: Unregistered SW');
          }
        }

        // Delete all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const name of cacheNames) {
            await caches.delete(name);
            console.info('🧹 SafeMode: Deleted cache', name);
          }
        }

        console.info('✅ SafeMode: Cleanup complete, redirecting to no-sw mode');
        setStatus('redirecting');

        // Redirect to home with no-sw flag after a brief delay
        setTimeout(() => {
          window.location.href = '/?no-sw=1';
        }, 1000);
      } catch (error) {
        console.error('❌ SafeMode: Cleanup error', error);
        // Still redirect even if cleanup fails
        setTimeout(() => {
          window.location.href = '/?no-sw=1';
        }, 1000);
      }
    };

    cleanupAndRedirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Safe Mode</CardTitle>
          <CardDescription>
            Cleaning cached app data and restarting without service worker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              {status === 'cleaning' && 'Clearing caches...'}
              {status === 'redirecting' && 'Redirecting...'}
            </span>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            You'll be redirected to the app in a moment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
