import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ResetPWA() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'resetting' | 'done'>('idle');
  const [details, setDetails] = useState<string[]>([]);

  const resetPWA = async () => {
    setStatus('resetting');
    const logs: string[] = [];

    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          logs.push(`✅ Unregistered SW: ${registration.scope}`);
        }
      }

      // Delete all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
          logs.push(`✅ Deleted cache: ${name}`);
        }
      }

      logs.push('✅ PWA reset complete');
      setDetails(logs);
      setStatus('done');

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      logs.push(`❌ Error: ${error}`);
      setDetails(logs);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset PWA</CardTitle>
          <CardDescription>
            Clear all service workers and caches to fix loading issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <Button onClick={resetPWA} className="w-full">
              Reset PWA
            </Button>
          )}

          {status === 'resetting' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Reset complete! Redirecting to homepage...
              </p>
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-xs font-mono space-y-1">
                {details.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
