import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap, Brain, Archive } from "lucide-react";
import { CronStatus } from "./types";

interface StatusCardProps {
  cronStatus: CronStatus;
}

export const StatusCard = ({ cronStatus }: StatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          System Status
        </CardTitle>
        <CardDescription>Cron jobs, embeddings, and memory consolidation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Daily Evolution</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.lastEvolution 
                ? `Last run: ${new Date(cronStatus.lastEvolution).toLocaleString()}`
                : "Not run yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Next: Daily at 2:00 AM
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-accent" />
              <h4 className="font-semibold text-sm">Weekly Discovery</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.lastDiscovery 
                ? `Last run: ${new Date(cronStatus.lastDiscovery).toLocaleString()}`
                : "Not run yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Next: Sundays at 3:00 AM
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Archive className="w-4 h-4 text-warning" />
              <h4 className="font-semibold text-sm">Memory Status</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Embeddings: {cronStatus.embeddingsProgress.generated}/{cronStatus.embeddingsProgress.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Archived: {cronStatus.archivedMemories} low-usage memories
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
