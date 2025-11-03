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

export async function getAdminStats() {
  try {
    const { data, error } = await supabase.rpc("get_admin_stats");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return null;
  }
}
