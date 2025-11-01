import { supabase } from "@/integrations/supabase/client";

export interface ErrorEvent {
  message: string;
  stack?: string;
  component?: string;
  user_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export class ErrorTracking {
  private static sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private static errorCount = 0;

  static async logError(error: ErrorEvent) {
    try {
      // Increment error count
      this.errorCount++;

      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();

      // Log to Supabase
      await supabase.from('user_events').insert({
        user_id: user?.id || null,
        event_type: 'error',
        event_data: {
          ...error,
          session_id: this.sessionId,
          error_count: this.errorCount,
          url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          memory: (performance as any).memory ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
          } : undefined,
        },
        page_url: window.location.pathname,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[${error.severity.toUpperCase()}]`, error.message, error);
      }

      // Critical errors should be alerted
      if (error.severity === 'critical' && this.errorCount <= 5) {
        this.notifyCriticalError(error);
      }
    } catch (err) {
      // Fallback to console if tracking fails
      console.error('Failed to track error:', err);
      console.error('Original error:', error);
    }
  }

  private static async notifyCriticalError(error: ErrorEvent) {
    // Could integrate with external services here
    console.error('🚨 CRITICAL ERROR:', error);
  }

  static setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        metadata: {
          promise: event.promise,
        },
      });
    });

    // Catch React errors (will be caught by ErrorBoundary but good to have)
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Check if it's a React error
      if (args[0]?.includes?.('React')) {
        this.logError({
          message: String(args[0]),
          severity: 'medium',
          component: 'React',
          metadata: { args },
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  static async logPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      await this.logError({
        message: `Performance threshold exceeded: ${metric}`,
        severity: value > threshold * 2 ? 'high' : 'medium',
        metadata: {
          metric,
          value,
          threshold,
          exceeded_by: value - threshold,
        },
      });
    }
  }

  static getSessionId() {
    return this.sessionId;
  }

  static getErrorCount() {
    return this.errorCount;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  ErrorTracking.setupGlobalHandlers();
}
