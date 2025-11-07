import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Image, Eye, Code, Brain, TrendingUp, Search, CheckCircle, XCircle, Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  feature: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  duration?: number;
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
}

const featureIcons: Record<string, any> = {
  "image-generation": Image,
  "vision-analysis": Eye,
  "code-analysis": Code,
  "reasoning": Brain,
  "trends": TrendingUp,
  "search": Search,
};

const featureNames: Record<string, string> = {
  "image-generation": "Image Generation",
  "vision-analysis": "Vision Analysis",
  "code-analysis": "Code Analysis",
  "reasoning": "Deep Reasoning",
  "trends": "Trending Topics",
  "search": "Real-time Search",
};

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Start using XAI features to see activity here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const FeatureIcon = featureIcons[activity.feature] || Search;
            const featureName = featureNames[activity.feature] || activity.feature;
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="p-2 rounded bg-primary/10">
                  <FeatureIcon className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{featureName}</span>
                    {activity.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    {activity.status === "failed" && (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    {activity.status === "pending" && (
                      <Clock className="w-4 h-4 text-warning animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    {activity.duration && (
                      <>
                        <span>•</span>
                        <span>{activity.duration}ms</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
