/**
 * Standardized Error Handler for Edge Functions
 * Provides consistent error responses and logging
 */

import { corsHeaders } from './cors.ts';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  requestId: string;
  retryAfter?: number;
  upgradeUrl?: string;
  timestamp?: string;
}

interface ErrorHandlerOptions {
  functionName: string;
  error: unknown;
  requestId?: string;
  userId?: string;
  logToDatabase?: boolean;
}

/**
 * Handle errors consistently across all edge functions
 * @param options - Error handling configuration
 * @returns Response object with appropriate status and headers
 */
export async function handleError(options: ErrorHandlerOptions): Promise<Response> {
  const { functionName, error, requestId = crypto.randomUUID(), userId } = options;
  
  // Log error with context
  console.error(`[${functionName}] Error:`, {
    error,
    requestId,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Map error messages to codes and status
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred.';
  const timestamp = new Date().toISOString();

  // Determine error type and appropriate response
  if (error instanceof Response) {
    status = error.status;
    
    // Rate limit error (429)
    if (status === 429) {
      const response: ErrorResponse = {
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId,
        retryAfter: 60,
        timestamp,
      };
      
      return new Response(JSON.stringify(response), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-Request-ID': requestId,
        },
      });
    }
    
    // Payment required (402)
    if (status === 402) {
      const response: ErrorResponse = {
        error: 'Insufficient credits. Please upgrade your plan.',
        code: 'PAYMENT_REQUIRED',
        requestId,
        upgradeUrl: '/pricing',
        timestamp,
      };
      
      return new Response(JSON.stringify(response), {
        status: 402,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      });
    }

    // Unauthorized (401)
    if (status === 401) {
      const response: ErrorResponse = {
        error: 'Authentication required.',
        code: 'UNAUTHORIZED',
        requestId,
        timestamp,
      };
      
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      });
    }
  }

  // Handle Error objects with specific error codes
  if (error instanceof Error) {
    errorMessage = error.message;

    // Map custom error codes from auth/validation
    if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('INVALID_TOKEN')) {
      status = 401;
      code = 'UNAUTHORIZED';
      errorMessage = 'Authentication required.';
    } else if (errorMessage.includes('MISSING_AUTH_HEADER')) {
      status = 401;
      code = 'MISSING_AUTH_HEADER';
      errorMessage = 'Authorization header is missing.';
    } else if (errorMessage.includes('INVALID_INPUT')) {
      status = 400;
      code = 'INVALID_INPUT';
    } else if (errorMessage.includes('MISSING_FIELD')) {
      status = 400;
      code = 'MISSING_FIELD';
    } else if (errorMessage.includes('PAYMENT_REQUIRED')) {
      status = 402;
      code = 'PAYMENT_REQUIRED';
      errorMessage = 'Insufficient credits. Please upgrade your plan.';
    } else if (errorMessage.includes('NOT_FOUND')) {
      status = 404;
      code = 'NOT_FOUND';
    } else if (errorMessage.includes('CONFLICT')) {
      status = 409;
      code = 'CONFLICT';
    } else if (errorMessage.includes('FORBIDDEN')) {
      status = 403;
      code = 'FORBIDDEN';
    }

    const response: ErrorResponse = {
      error: errorMessage,
      code,
      requestId,
      timestamp,
    };
    
    return new Response(JSON.stringify(response), {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
    });
  }

  // Unknown error type
  const response: ErrorResponse = {
    error: errorMessage,
    code: 'UNKNOWN_ERROR',
    details: String(error),
    requestId,
    timestamp,
  };
  
  return new Response(JSON.stringify(response), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    },
  });
}

/**
 * Validate request body against expected schema
 * @param body - Request body to validate
 * @param requiredFields - Array of required field names
 * @throws Error if validation fails
 */
export function validateRequestBody(body: unknown, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const missingFields = requiredFields.filter(
    field => !(field in (body as Record<string, unknown>))
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Create a success response with standard format
 * @param data - Response data
 * @param requestId - Optional request ID
 * @returns Response object
 */
export function successResponse(data: unknown, requestId?: string): Response {
  const id = requestId || crypto.randomUUID();
  return new Response(JSON.stringify({
    data,
    requestId: id,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Request-ID': id,
    },
  });
}

/**
 * Create a streaming response with error handling
 * @param stream - ReadableStream to return
 * @param requestId - Optional request ID
 * @returns Response object
 */
export function streamResponse(stream: ReadableStream, requestId?: string): Response {
  const id = requestId || crypto.randomUUID();
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Request-ID': id,
    },
  });
}