import { supabase } from '@/integrations/supabase/client';

export interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export class Observability {
  private static sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private static logBuffer: LogEvent[] = [];
  private static flushInterval: NodeJS.Timeout | null = null;
  private static readonly FLUSH_INTERVAL_MS = 10000; // 10 seconds
  private static readonly MAX_BUFFER_SIZE = 50;

  static async log(event: LogEvent) {
    try {
      // Add to buffer
      this.logBuffer.push({
        ...event,
        metadata: {
          ...event.metadata,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });

      // Flush if buffer is full
      if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
        await this.flush();
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = {
          info: 'ℹ️',
          warn: '⚠️',
          error: '❌',
          debug: '🐛',
        };
        console.log(
          `${emoji[event.level]} [${event.context || 'APP'}]`,
          event.message,
          event.metadata
        );
      }
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  static async flush() {
    if (this.logBuffer.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Send all buffered logs to Supabase
      const events = this.logBuffer.map(log => ({
        user_id: user?.id || null,
        event_type: 'log',
        event_data: {
          level: log.level,
          message: log.message,
          context: log.context,
          metadata: log.metadata,
        },
        page_url: window.location.pathname,
      }));

      await supabase.from('user_events').insert(events);

      // Clear buffer
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Keep logs in buffer to retry later
    }
  }

  static startAutoFlush() {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Flush on visibility change (user switching tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }

  static stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  // Convenience methods
  static info(message: string, context?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'info', message, context, metadata });
  }

  static warn(message: string, context?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'warn', message, context, metadata });
  }

  static error(message: string, context?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'error', message, context, metadata });
  }

  static debug(message: string, context?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'debug', message, context, metadata });
  }

  // API call tracking
  static async trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    success: boolean
  ) {
    await this.log({
      level: success ? 'info' : 'error',
      message: `API ${method} ${endpoint}`,
      context: 'API',
      metadata: {
        endpoint,
        method,
        duration,
        statusCode,
        success,
      },
    });
  }

  // Feature usage tracking
  static async trackFeature(feature: string, action: string, metadata?: Record<string, any>) {
    await this.log({
      level: 'info',
      message: `Feature: ${feature} - ${action}`,
      context: 'Feature',
      metadata: {
        feature,
        action,
        ...metadata,
      },
    });
  }

  // User action tracking
  static async trackUserAction(action: string, target?: string, metadata?: Record<string, any>) {
    await this.log({
      level: 'info',
      message: `User action: ${action}${target ? ` on ${target}` : ''}`,
      context: 'User',
      metadata: {
        action,
        target,
        ...metadata,
      },
    });
  }

  static getSessionId() {
    return this.sessionId;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  Observability.startAutoFlush();
}
