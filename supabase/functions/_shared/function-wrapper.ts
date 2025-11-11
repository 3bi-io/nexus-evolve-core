/**
 * Standardized Edge Function Wrapper
 * Provides consistent error handling, logging, and request tracking
 */

import { corsHeaders } from './cors.ts';
import { handleError } from './error-handler.ts';
import { createLogger, Logger } from './logger.ts';

export interface FunctionContext {
  logger: Logger;
  requestId: string;
  startTime: number;
}

export type FunctionHandler = (
  req: Request,
  context: FunctionContext
) => Promise<Response>;

/**
 * Wraps an edge function with standardized error handling and logging
 * @param functionName - Name of the edge function
 * @param handler - The actual function logic
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  functionName: string,
  handler: FunctionHandler
) {
  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const requestId = crypto.randomUUID();
    const logger = createLogger(functionName, requestId);
    const startTime = Date.now();

    logger.info('Request started', { method: req.method, url: req.url });

    try {
      const context: FunctionContext = {
        logger,
        requestId,
        startTime,
      };

      const response = await handler(req, context);

      const duration = Date.now() - startTime;
      logger.info('Request completed', { 
        status: response.status,
        duration: `${duration}ms`
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Request failed', { 
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`
      });

      return handleError({
        functionName,
        error,
        requestId,
        userId: undefined,
      });
    }
  };
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T = any>(
  req: Request,
  logger: Logger
): Promise<T | null> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    logger.error('Failed to parse request body', error);
    return null;
  }
}

/**
 * Extract user ID from authorization header
 */
export function extractUserId(req: Request, logger: Logger): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    logger.debug('No authorization header found');
    return null;
  }

  try {
    // Extract JWT token and decode (basic extraction, not verification)
    const token = authHeader.replace('Bearer ', '');
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || null;
  } catch (error) {
    logger.warn('Failed to extract user ID from token', error);
    return null;
  }
}
