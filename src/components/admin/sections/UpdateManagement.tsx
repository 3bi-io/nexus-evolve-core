import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateInfo {
  currentVersion: string;
  updateAvailable: boolean;
  lastCheck: string;
  downloadInProgress: boolean;
  serviceWorkerActive: boolean;
  cacheCount: number;
}

/**
 * Admin panel for managing PWA updates and cache
 */
export function UpdateManagement() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    currentVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    updateAvailable: false,
    lastCheck: new Date().toISOString(),
    downloadInProgress: false,
    serviceWorkerActive: false,
    cacheCount: 0,
  });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadUpdateInfo();
  }, []);

  const loadUpdateInfo = async () => {
    try {
      // Check service worker status
      const swActive = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
      
      // Get cache info
      let cacheCount = 0;
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        cacheCount = cacheNames.length;
      }

      // Check localStorage flags
      const updateAvailable = localStorage.getItem('pwa-update-available') === 'true';
      const downloadInProgress = localStorage.getItem('pwa-download-in-progress') === 'true';
      const lastCheck = localStorage.getItem('pwa-last-check') || new Date().toISOString();

      setUpdateInfo({
        currentVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
        updateAvailable,
        lastCheck,
        downloadInProgress,
        serviceWorkerActive: swActive,
        cacheCount,
      });
    } catch (error) {
      console.error('Failed to load update info:', error);
    }
  };

  const checkForUpdates = async () => {
    setChecking(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          localStorage.setItem('pwa-last-check', new Date().toISOString());
          
          toast.success('Update check complete', {
            description: 'No new updates found',
          });
        }
      }
      
      await loadUpdateInfo();
    } catch (error) {
      toast.error('Failed to check for updates', {
        description: String(error),
      });
    } finally {
      setChecking(false);
    }
  };

  const forceUpdate = () => {
    toast.info('Refreshing app...', { duration: 2000 });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearCache = () => {
    window.location.href = '/clear-cache';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Management
          </CardTitle>
          <CardDescription>
            Manage app updates, service workers, and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Current Version</div>
              <div className="font-semibold">{updateInfo.currentVersion}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Service Worker</div>
              <div className="flex items-center gap-2">
                {updateInfo.serviceWorkerActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Cache Storage</div>
              <div className="font-semibold">{updateInfo.cacheCount} caches</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Last Update Check</div>
              <div className="text-sm">
                {new Date(updateInfo.lastCheck).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Update Status */}
          {updateInfo.updateAvailable && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Update Available</div>
                <div className="text-sm text-muted-foreground">
                  {updateInfo.downloadInProgress 
                    ? 'Downloading in background...'
                    : 'Ready to install'
                  }
                </div>
              </div>
              <Button onClick={forceUpdate} size="sm">
                Install Now
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={checkForUpdates}
              disabled={checking}
              variant="default"
            >
              {checking ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for Updates
                </>
              )}
            </Button>

            <Button onClick={forceUpdate} variant="outline">
              Force Refresh
            </Button>

            <Button onClick={clearCache} variant="outline">
              Clear All Cache
            </Button>
          </div>

          {/* Background Update Info */}
          <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
            <div className="font-medium">Automatic Update Behavior</div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Updates download silently in the background</li>
              <li>Users are prompted when idle (30+ seconds of inactivity)</li>
              <li>Service worker checks for updates every 60 seconds</li>
              <li>Cache invalidation happens automatically on version change</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
