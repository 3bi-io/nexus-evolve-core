/**
 * Authentication Utilities for Edge Functions
 * Provides standardized authentication patterns
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

export interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

/**
 * Require authentication for the request
 * @param req - Request object
 * @param supabase - Supabase client
 * @returns Authenticated user
 * @throws Error if authentication fails
 */
export async function requireAuth(req: Request, supabase: SupabaseClient): Promise<User> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('MISSING_AUTH_HEADER');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('INVALID_TOKEN');
  }
  
  return user;
}

/**
 * Optional authentication - returns null if not authenticated
 * @param req - Request object
 * @param supabase - Supabase client
 * @returns User object or null
 */
export async function optionalAuth(req: Request, supabase: SupabaseClient): Promise<User | null> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

/**
 * Extract user ID from Authorization header without full validation
 * Useful for logging or non-critical operations
 * @param req - Request object
 * @returns User ID or null
 */
export function extractUserId(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    // Simple JWT decode (not validated, just for ID extraction)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}
