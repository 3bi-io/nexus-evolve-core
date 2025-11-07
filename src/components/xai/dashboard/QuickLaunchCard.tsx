import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, ArrowRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickLaunchCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  status?: "available" | "rate-limited" | "premium";
  stats?: {
    totalUses?: number;
    avgResponseTime?: number;
  };
  className?: string;
  onLaunch?: () => void;
}

export function QuickLaunchCard({
  icon: Icon,
  title,
  description,
  route,
  status = "available",
  stats,
  className,
  onLaunch,
}: QuickLaunchCardProps) {
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch();
    } else {
      navigate(route);
    }
  };

  const statusColors = {
    available: "bg-success/10 text-success border-success/20",
    "rate-limited": "bg-warning/10 text-warning border-warning/20",
    premium: "bg-primary/10 text-primary border-primary/20",
  };

  const statusLabels = {
    available: "Available",
    "rate-limited": "Rate Limited",
    premium: "Premium",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50",
        "cursor-pointer",
        className
      )}
      onClick={handleLaunch}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 space-y-4">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {stats.totalUses !== undefined && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{stats.totalUses}</span>
                <span>uses</span>
              </div>
            )}
            {stats.avgResponseTime !== undefined && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{stats.avgResponseTime}ms</span>
                <span>avg</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            className="group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleLaunch();
            }}
          >
            Launch
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // Could open a modal with more info
            }}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
