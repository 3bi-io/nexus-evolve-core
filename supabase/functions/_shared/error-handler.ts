/**
 * Standardized Error Handler for Edge Functions
 * Provides consistent error responses and logging
 */

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  requestId: string;
  retryAfter?: number;
  upgradeUrl?: string;
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

  // Determine error type and appropriate response
  if (error instanceof Response) {
    const status = error.status;
    
    // Rate limit error (429)
    if (status === 429) {
      const response: ErrorResponse = {
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId,
        retryAfter: 60,
      };
      
      return new Response(JSON.stringify(response), {
        status: 429,
        headers: {
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
      };
      
      return new Response(JSON.stringify(response), {
        status: 402,
        headers: {
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
      };
      
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      });
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const response: ErrorResponse = {
      error: error.message,
      code: 'INTERNAL_ERROR',
      requestId,
    };
    
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
    });
  }

  // Unknown error type
  const response: ErrorResponse = {
    error: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
    details: String(error),
    requestId,
  };
  
  return new Response(JSON.stringify(response), {
    status: 500,
    headers: {
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
  return new Response(JSON.stringify({
    data,
    requestId: requestId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId || crypto.randomUUID(),
    },
  });
}