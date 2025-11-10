import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Brain, Archive, Sparkles, PlayCircle, Database } from "lucide-react";
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
          Automated Systems Status
        </CardTitle>
        <CardDescription>Real-time monitoring of all scheduled AI improvement cycles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Daily Evolution</h4>
              <Badge variant="secondary" className="ml-auto text-xs">2:00 AM</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.lastEvolution 
                ? `${new Date(cronStatus.lastEvolution).toLocaleDateString()}`
                : "Pending first run"}
            </p>
            <p className="text-xs text-success mt-1">
              ✓ Performance, behaviors, A/B tests
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-destructive" />
              <h4 className="font-semibold text-sm">Memory Pruning</h4>
              <Badge variant="secondary" className="ml-auto text-xs">3:00 AM</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.lastPruning 
                ? `${new Date(cronStatus.lastPruning).toLocaleDateString()}`
                : "Pending first run"}
            </p>
            <p className="text-xs text-warning mt-1">
              {cronStatus.archivedMemories} low-value memories
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-accent" />
              <h4 className="font-semibold text-sm">Capability Discovery</h4>
              <Badge variant="secondary" className="ml-auto text-xs">4:00 AM</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.lastDiscovery 
                ? `${new Date(cronStatus.lastDiscovery).toLocaleDateString()}`
                : "Pending first run"}
            </p>
            <p className="text-xs text-accent mt-1">
              ✓ Pattern analysis & suggestions
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-4 h-4 text-success" />
              <h4 className="font-semibold text-sm">Scheduled Agents</h4>
              <Badge variant="secondary" className="ml-auto text-xs">15 min</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {cronStatus.scheduledAgentRuns || 0} agents executed today
            </p>
            <p className="text-xs text-success mt-1">
              ✓ Automated task execution
            </p>
          </div>

          <div className="col-span-full p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <h4 className="font-semibold text-sm">Semantic Search</h4>
              <Badge variant="outline" className="ml-auto">
                {cronStatus.embeddingsProgress.generated}/{cronStatus.embeddingsProgress.total} embeddings
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Memory embeddings: {Math.round((cronStatus.embeddingsProgress.generated / Math.max(cronStatus.embeddingsProgress.total, 1)) * 100)}%</span>
              <span>•</span>
              <span>Archived memories: {cronStatus.archivedMemories}</span>
              <span>•</span>
              <span>Cross-agent learning enabled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
