import { supabase } from "@/integrations/supabase/client";

export interface AdminActionParams {
  action_type: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, any>;
}

export async function logAdminAction(params: AdminActionParams): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("log_admin_action", {
      _action_type: params.action_type,
      _target_type: params.target_type || null,
      _target_id: params.target_id || null,
      _details: params.details || {},
    });

    if (error) {
      console.error("Failed to log admin action:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to log admin action:", error);
    return null;
  }
}

// Cache for admin stats (30 seconds TTL)
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

export async function getAdminStats(forceRefresh: boolean = false) {
  // Return cached data if available and not expired
  if (!forceRefresh && statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
    console.log("Returning cached admin stats");
    return statsCache.data;
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-admin-stats', {
      method: 'GET'
    });

    if (error) {
      console.error("Failed to fetch admin stats:", error);
      throw error;
    }

    // Update cache
    statsCache = {
      data,
      timestamp: Date.now()
    };

    return data;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    
    // Return cached data if available, even if expired
    if (statsCache) {
      console.log("Returning stale cached data due to error");
      return statsCache.data;
    }
    
    throw error;
  }
}

export function clearAdminStatsCache() {
  statsCache = null;
}
