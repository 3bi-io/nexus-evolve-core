import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Sparkles, TrendingUp, AlertCircle, Zap, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.type) {
      case 'capability_approved':
        return <Sparkles className="h-4 w-4 text-success" />;
      case 'evolution_complete':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'behavior_deactivated':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'experiment_concluded':
        return <Zap className="h-4 w-4 text-accent" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
        !notification.read && "bg-primary/5"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight">
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          {notification.metadata?.capability_name && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {notification.metadata.capability_name}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
