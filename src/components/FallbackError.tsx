import { AlertTriangle, Home, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FallbackErrorProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const isServiceWorkerError = (error?: Error): boolean => {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  return (
    msg.includes('chunk') && msg.includes('load') ||
    msg.includes('dynamically imported') ||
    msg.includes('fetch') && msg.includes('failed') ||
    msg.includes('service worker') ||
    stack.includes('sw.js') ||
    stack.includes('service-worker')
  );
};

/**
 * User-friendly error fallback component
 * Displayed when error boundary catches an error
 */
export function FallbackError({ error, resetErrorBoundary }: FallbackErrorProps) {
  const isCacheIssue = isServiceWorkerError(error);
  
  const handleClearCache = () => {
    window.location.href = '/clear-cache';
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            <CardTitle>{isCacheIssue ? 'Loading Issue Detected' : 'Something went wrong'}</CardTitle>
          </div>
          <CardDescription>
            {isCacheIssue 
              ? "This appears to be a caching issue. Clearing your cache should fix it."
              : "We've encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or return home."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
          
          {isCacheIssue && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                💡 <strong>Tip:</strong> Clearing your cache will remove old data and load the latest version.
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {isCacheIssue && (
              <Button 
                onClick={handleClearCache} 
                className="w-full"
                aria-label="Clear cache and reload"
              >
                <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Clear Cache & Reload
              </Button>
            )}
            {resetErrorBoundary && (
              <Button 
                onClick={resetErrorBoundary} 
                variant={isCacheIssue ? "outline" : "default"}
                className="w-full"
                aria-label="Try again"
              >
                <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="w-full"
              aria-label="Go to home page"
            >
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
          </div>
          
          {isCacheIssue && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Or try visiting{' '}
              <a href="/?no-sw=1" className="text-primary hover:underline">
                without service worker
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}