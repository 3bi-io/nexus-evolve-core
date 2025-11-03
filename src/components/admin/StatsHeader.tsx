import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { Card } from "@/components/ui/card";
import { Users, Bot, MessageSquare, Megaphone, AlertCircle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsHeader() {
  const { stats, loading } = useRealtimeStats();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-500" },
    { label: "Total Agents", value: stats.total_agents, icon: Bot, color: "text-purple-500" },
    { label: "Sessions", value: stats.total_sessions, icon: MessageSquare, color: "text-green-500" },
    { label: "Announcements", value: stats.active_announcements, icon: Megaphone, color: "text-yellow-500" },
    { label: "Pending Approvals", value: stats.pending_agent_approvals, icon: AlertCircle, color: "text-orange-500" },
    { label: "Credits Distributed", value: stats.total_credits_distributed.toLocaleString(), icon: CreditCard, color: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${item.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
