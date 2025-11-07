/**
 * Structured Logger for Edge Functions
 * Provides consistent logging patterns with request IDs
 */

export interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, error?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, data?: any) => void;
}

/**
 * Create a logger instance with function name and request ID
 * @param functionName - Name of the edge function
 * @param requestId - Unique request identifier
 * @returns Logger instance
 */
export function createLogger(functionName: string, requestId: string): Logger {
  const prefix = `[${functionName}][${requestId}]`;
  
  return {
    info: (message: string, meta?: any) => {
      const logData = meta ? JSON.stringify(meta) : '';
      console.log(`${prefix} ${message}`, logData);
    },
    
    error: (message: string, error?: any) => {
      const errorData = error ? (error instanceof Error ? error.message : JSON.stringify(error)) : '';
      console.error(`${prefix} ERROR: ${message}`, errorData);
      if (error?.stack) {
        console.error(`${prefix} Stack:`, error.stack);
      }
    },
    
    warn: (message: string, meta?: any) => {
      const logData = meta ? JSON.stringify(meta) : '';
      console.warn(`${prefix} WARN: ${message}`, logData);
    },
    
    debug: (message: string, data?: any) => {
      const debugData = data ? JSON.stringify(data) : '';
      console.log(`${prefix} DEBUG: ${message}`, debugData);
    }
  };
}

/**
 * Create a simple logger without request context
 * @param functionName - Name of the edge function
 * @returns Logger instance
 */
export function createSimpleLogger(functionName: string): Logger {
  return createLogger(functionName, 'no-request-id');
}
