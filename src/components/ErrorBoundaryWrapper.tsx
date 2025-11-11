import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundaryWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {this.props.fallbackTitle || 'Something went wrong'}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                {this.props.fallbackMessage || 
                  'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'}
              </p>
              {this.state.error && (
                <details className="mt-2 p-3 bg-muted rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details
                  </summary>
                  <pre className="overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="mt-4 flex gap-2">
                <Button onClick={this.handleReset} size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                >
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackTitle?: string,
  fallbackMessage?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundaryWrapper
        fallbackTitle={fallbackTitle}
        fallbackMessage={fallbackMessage}
      >
        <Component {...props} />
      </ErrorBoundaryWrapper>
    );
  };
}
