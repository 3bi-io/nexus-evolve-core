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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to evolution_logs table
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('evolution_logs').insert({
        user_id: user.id,
        log_type: 'error',
        description: `UI Error: ${error.message}`,
        metrics: {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
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
