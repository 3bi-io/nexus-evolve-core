import React, { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FallbackError } from './FallbackError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
    });
    
    // Check if this might be a service worker issue
    const isSwIssue = this.isServiceWorkerError(error);
    if (isSwIssue) {
      console.warn('🔧 Possible service worker cache issue detected');
    }
    
    // Log error to evolution_logs table
    this.logError(error, errorInfo);
  }

  private isServiceWorkerError(error: Error): boolean {
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
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isSwIssue = this.isServiceWorkerError(error);

      await supabase.from('evolution_logs').insert({
        user_id: user.id,
        log_type: 'error',
        description: `UI Error: ${error.message}`,
        metrics: {
          error: error.toString(),
          message: error.message,
          name: error.name,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          isMobile: window.innerWidth < 768,
          url: window.location.href,
          serviceWorkerIssue: isSwIssue,
          serviceWorkerActive: 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
        },
        success: false,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return <FallbackError error={this.state.error || undefined} resetErrorBoundary={this.handleReset} />;
    }

    return this.props.children;
  }
}
