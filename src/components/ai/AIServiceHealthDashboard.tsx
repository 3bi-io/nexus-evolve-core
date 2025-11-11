import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const AIServiceHealthDashboard = () => {
  const { validation, isLoading, refetch, hasIssues, criticalIssues } = useSecretValidation();

  const getStatusIcon = (valid: boolean, error?: string) => {
    if (error === 'Not configured') {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
    return valid ? (
      <CheckCircle2 className="h-5 w-5 text-success" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive" />
    );
  };

  const getStatusBadge = (valid: boolean, error?: string) => {
    if (error === 'Not configured') {
      return <Badge variant="outline" className="text-warning border-warning">Not Configured</Badge>;
    }
    return valid ? (
      <Badge variant="outline" className="text-success border-success">Healthy</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  const getServiceName = (key: string) => {
    const names: Record<string, string> = {
      OPENAI_API_KEY: 'OpenAI',
      LOVABLE_API_KEY: 'Lovable AI',
      ANTHROPIC_API_KEY: 'Anthropic (Claude)',
      GROK_API_KEY: 'xAI (Grok)',
      TAVILY_API_KEY: 'Tavily Search',
      ELEVENLABS_API_KEY: 'ElevenLabs',
      REPLICATE_API_KEY: 'Replicate',
      MEM0_API_KEY: 'Mem0',
      PINECONE_API_KEY: 'Pinecone',
      PINECONE_HOST: 'Pinecone Host',
      HUGGINGFACE_API_KEY: 'HuggingFace',
    };
    return names[key] || key;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Service Health</CardTitle>
            <CardDescription>
              Real-time status of all AI provider API keys
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasIssues && (
          <Alert variant={criticalIssues > 0 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalIssues > 0
                ? `${criticalIssues} critical API key(s) need attention`
                : `${validation?.summary.invalid || 0} service(s) have issues`}
            </AlertDescription>
          </Alert>
        )}

        {validation && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>Service</div>
              <div>Status</div>
              <div>Last Checked</div>
              <div>Error</div>
            </div>

            {Object.entries(validation.results).map(([key, result]) => (
              <div
                key={key}
                className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.valid, result.error)}
                  <span className="font-medium">{getServiceName(key)}</span>
                </div>
                <div>{getStatusBadge(result.valid, result.error)}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(result.lastChecked), { addSuffix: true })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.error || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {validation && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{validation.summary.valid}</div>
              <div className="text-xs text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{validation.summary.invalid}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{validation.summary.notConfigured}</div>
              <div className="text-xs text-muted-foreground">Not Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{validation.summary.total}</div>
              <div className="text-xs text-muted-foreground">Total Services</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
