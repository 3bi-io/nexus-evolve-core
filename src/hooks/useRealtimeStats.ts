import { useState, useEffect } from "react";
import { getAdminStats } from "@/lib/admin-utils";

export interface AdminStats {
  total_users: number;
  total_agents: number;
  total_sessions: number;
  active_announcements: number;
  pending_agent_approvals: number;
  total_credits_distributed: number;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const data = await getAdminStats();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      setStats(data as unknown as AdminStats);
    }
    setLoading(false);
  };

  return { stats, loading, refresh: fetchStats };
}
