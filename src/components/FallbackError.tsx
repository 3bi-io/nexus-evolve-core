import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FallbackErrorProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

/**
 * User-friendly error fallback component
 * Displayed when error boundary catches an error
 */
export function FallbackError({ error, resetErrorBoundary }: FallbackErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            We've encountered an unexpected error. Don't worry, your data is safe. 
            Try refreshing the page or return home.
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
          <div className="flex gap-2">
            {resetErrorBoundary && (
              <Button 
                onClick={resetErrorBoundary} 
                className="flex-1"
                aria-label="Try again"
              >
                <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="flex-1"
              aria-label="Go to home page"
            >
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}