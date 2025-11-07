import { TrendingUp, TrendingDown, Zap, DollarSign, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveStatsBarProps {
  stats?: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    creditsUsed: number;
  };
  loading?: boolean;
}

export function LiveStatsBar({ stats, loading }: LiveStatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Requests Today",
      value: stats.totalRequests.toLocaleString(),
      icon: Zap,
      trend: stats.totalRequests > 0 ? "up" : "neutral",
      color: "text-primary",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: CheckCircle,
      trend: stats.successRate >= 95 ? "up" : stats.successRate >= 80 ? "neutral" : "down",
      color: stats.successRate >= 95 ? "text-success" : stats.successRate >= 80 ? "text-warning" : "text-destructive",
    },
    {
      label: "Avg Response Time",
      value: `${Math.round(stats.avgResponseTime)}ms`,
      icon: TrendingUp,
      trend: stats.avgResponseTime < 1000 ? "up" : stats.avgResponseTime < 3000 ? "neutral" : "down",
      color: stats.avgResponseTime < 1000 ? "text-success" : "text-muted-foreground",
    },
    {
      label: "Credits Used Today",
      value: stats.creditsUsed.toFixed(2),
      icon: DollarSign,
      trend: "neutral",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{item.value}</span>
            {item.trend === "up" && (
              <TrendingUp className="w-4 h-4 text-success" />
            )}
            {item.trend === "down" && (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
