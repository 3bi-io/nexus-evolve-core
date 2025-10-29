/**
 * Rate Limiting Middleware for Edge Functions
 * 
 * Prevents abuse by limiting requests per IP address or user ID
 */

interface RateLimitOptions {
  maxRequests: number;      // Max requests allowed in window
  windowMinutes: number;    // Time window in minutes
  identifier: string;       // IP address or user ID
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Check if request is within rate limits
 * Uses in-memory storage (resets on function cold start)
 * For production, consider using Redis or Supabase storage
 */
const requestCounts = new Map<string, { count: number; resetAt: Date }>();

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { maxRequests, windowMinutes, identifier } = options;
  
  const now = new Date();
  const key = `${identifier}`;
  
  // Get existing rate limit data
  const existing = requestCounts.get(key);
  
  // If no existing data or window expired, create new window
  if (!existing || existing.resetAt < now) {
    const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);
    requestCounts.set(key, { count: 1, resetAt });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }
  
  // Check if over limit
  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfter,
    };
  }
  
  // Increment count
  existing.count++;
  requestCounts.set(key, existing);
  
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Get client IP address from request
 * Works with common proxy headers
 */
export function getClientIP(req: Request): string {
  // Check common proxy headers
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
        'Retry-After': String(result.retryAfter || 0),
      },
    }
  );
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = new Date();
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetAt < now) {
      requestCounts.delete(key);
    }
  }
}