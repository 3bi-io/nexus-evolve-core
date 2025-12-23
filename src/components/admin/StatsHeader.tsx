import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { Users, Bot, MessageSquare, Megaphone, AlertCircle, CreditCard, RefreshCw, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clearAdminStatsCache } from "@/lib/admin-utils";

export function StatsHeader() {
  const { isMobile } = useResponsive();
  const { stats, loading, error, lastFetch, refresh } = useRealtimeStats();
  
  const handleForceRefresh = () => {
    clearAdminStatsCache();
    refresh();
  };

  if (loading && !stats) {
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

  if (error && !stats) {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load admin stats: {error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefresh}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
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
        {error && (
          <Alert variant="destructive" className="mb-3">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Stats may be outdated. Last updated: {lastFetch?.toLocaleTimeString() || 'Never'}
            </AlertDescription>
          </Alert>
        )}
        <div className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide",
          "pb-3 -mx-4 px-4",
          error && "opacity-75"
        )}>
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="flex-shrink-0 min-w-[140px] relative">
                <CardContent className="p-4">
                  {loading && <RefreshCw className="absolute top-2 right-2 h-3 w-3 animate-spin text-muted-foreground" />}
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {lastFetch && `Last updated: ${lastFetch.toLocaleTimeString()}`}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Force Refresh
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Stats may be outdated</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className={cn("grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8", error && "opacity-75")}>
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 relative">
                {loading && <RefreshCw className="absolute top-2 right-2 h-3 w-3 animate-spin text-muted-foreground" />}
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
    </div>
  );
}
