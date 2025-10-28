import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Sparkles } from "lucide-react";
import { ABExperiment } from "./types";

interface ExperimentsCardProps {
  experiments: ABExperiment[];
}

export const ExperimentsCard = ({ experiments }: ExperimentsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Active Experiments
        </CardTitle>
        <CardDescription>A/B testing and optimization trials</CardDescription>
      </CardHeader>
      <CardContent>
        {experiments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active experiments. System will create tests automatically as it learns.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiments.map((exp) => (
              <div key={exp.id} className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{exp.experiment_name}</h4>
                      <Badge variant={exp.active ? "default" : "secondary"}>
                        {exp.active ? "Active" : "Ended"}
                      </Badge>
                      {exp.winner && (
                        <Badge variant="outline">Winner: {exp.winner}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(exp.started_at).toLocaleDateString()}
                      {exp.ended_at && ` • Ended: ${new Date(exp.ended_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {exp.metrics && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Metrics: {JSON.stringify(exp.metrics, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
