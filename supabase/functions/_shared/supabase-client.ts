/**
 * Shared Supabase Client Utilities
 * Provides standardized Supabase client initialization and authentication
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

export interface AuthenticatedClientResult {
  supabase: SupabaseClient;
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Initialize Supabase client with service role
 * @returns Supabase client instance
 */
export function initSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create authenticated Supabase client from Authorization header
 * @param authHeader - Authorization header value
 * @returns Authenticated client with user info
 * @throws Error if authentication fails
 */
export async function createAuthenticatedClient(
  authHeader: string
): Promise<AuthenticatedClientResult> {
  const supabase = initSupabaseClient();
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('UNAUTHORIZED');
  }
  
  return { supabase, user };
}
