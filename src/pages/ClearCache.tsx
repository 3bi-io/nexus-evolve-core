import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'idle' | 'clearing' | 'success' | 'error';

interface CacheInfo {
  serviceWorkers: number;
  caches: string[];
  version: string;
  lastUpdate?: string;
}

export default function ClearCache() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('idle');
  const [details, setDetails] = useState<string[]>([]);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  useEffect(() => {
    getCacheInfo();
  }, []);

  const getCacheInfo = async () => {
    try {
      const info: CacheInfo = {
        serviceWorkers: 0,
        caches: [],
        version: import.meta.env.VITE_APP_VERSION || 'unknown',
        lastUpdate: localStorage.getItem('pwa-update-available') || undefined,
      };

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorkers = registrations.length;
      }

      if ('caches' in window) {
        info.caches = await caches.keys();
      }

      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to get cache info:', error);
    }
  };

  const clearCache = async () => {
    setStatus('clearing');
    const logs: string[] = [];

    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          logs.push(`✅ Unregistered service worker: ${registration.scope}`);
        }
        if (registrations.length === 0) {
          logs.push('ℹ️ No service workers found');
        }
      }

      // Delete all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
          logs.push(`✅ Deleted cache: ${name}`);
        }
        if (cacheNames.length === 0) {
          logs.push('ℹ️ No caches found');
        }
      }

      // Clear localStorage PWA flags
      localStorage.removeItem('pwa-update-available');
      localStorage.removeItem('pwa-registration-error');
      logs.push('✅ Cleared PWA flags');

      logs.push('✅ Cache cleared successfully');
      setDetails(logs);
      setStatus('success');

      toast.success('Cache cleared', {
        description: 'The page will reload with fresh content',
      });

      // Reload after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      logs.push(`❌ Error: ${error}`);
      setDetails(logs);
      setStatus('error');
      
      toast.error('Failed to clear cache', {
        description: 'Try reloading the page manually',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Clear Cache
          </CardTitle>
          <CardDescription>
            Clear service workers and cached data to fix loading issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Info */}
          {cacheInfo && status === 'idle' && (
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Workers:</span>
                <span className="font-medium">{cacheInfo.serviceWorkers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cached Storage:</span>
                <span className="font-medium">{cacheInfo.caches.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Version:</span>
                <span className="font-medium">{cacheInfo.version}</span>
              </div>
              {cacheInfo.lastUpdate && (
                <div className="pt-2 border-t">
                  <span className="text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Update available
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="space-y-2">
              <Button onClick={clearCache} className="w-full" size="lg">
                Clear Cache & Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          )}

          {/* Clearing Status */}
          {status === 'clearing' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Clearing cache...</span>
            </div>
          )}

          {/* Success Status */}
          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 py-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Cache cleared successfully!</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Redirecting to homepage...
              </p>
            </div>
          )}

          {/* Error Status */}
          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 py-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Failed to clear cache</span>
              </div>
              <Button onClick={clearCache} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}

          {/* Details Log */}
          {details.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
                {details.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Having issues? Try visiting{' '}
            <a href="/?no-sw=1" className="text-primary hover:underline">
              home page without service worker
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
