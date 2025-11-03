import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { Users, Bot, MessageSquare, Megaphone, AlertCircle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsHeader() {
  const { isMobile } = useMobile();
  const { stats, loading } = useRealtimeStats();

  if (loading) {
    return (
      <div className={cn(
        isMobile ? "flex gap-3 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 mb-6" : "grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={cn(isMobile ? "flex-shrink-0 min-w-[140px] h-20" : "h-20")} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Users", value: stats.total_users, icon: Users, color: "text-blue-500" },
    { label: "Agents", value: stats.total_agents, icon: Bot, color: "text-purple-500" },
    { label: "Sessions", value: stats.total_sessions, icon: MessageSquare, color: "text-green-500" },
    { label: "Announcements", value: stats.active_announcements, icon: Megaphone, color: "text-yellow-500" },
    { label: "Approvals", value: stats.pending_agent_approvals, icon: AlertCircle, color: "text-orange-500" },
    { label: "Credits", value: stats.total_credits_distributed.toLocaleString(), icon: CreditCard, color: "text-emerald-500" },
  ];

  if (isMobile) {
    // Compact horizontal scroll on mobile
    return (
      <div className="mb-6">
        <div className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide",
          "pb-3 -mx-4 px-4"
        )}>
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="flex-shrink-0 min-w-[140px]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-4 h-4", stat.color)} />
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop: Full width grid
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
