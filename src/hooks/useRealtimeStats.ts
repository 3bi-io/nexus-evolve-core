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
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await getAdminStats();
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Validate data structure
        if ('total_users' in data && 'total_agents' in data) {
          setStats(data as AdminStats);
          setLastFetch(new Date());
        } else {
          throw new Error('Invalid stats data structure');
        }
      } else {
        throw new Error('Invalid response from admin stats');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, lastFetch, refresh: fetchStats };
}
