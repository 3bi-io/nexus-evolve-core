import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, DollarSign, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { useAdvancedRouter } from '@/hooks/useUnifiedAIRouter';

export const RouterMetricsDashboard = () => {
  const { getMetrics, getLoadBalancing, resetMetrics } = useAdvancedRouter();
  const metrics = getMetrics();
  const loadBalancing = getLoadBalancing();

  const totalCalls = Object.values(metrics).reduce((sum, m) => sum + m.totalCalls, 0);
  const totalCost = Object.values(metrics).reduce((sum, m) => sum + m.totalCost, 0);
  const avgSuccessRate = Object.values(metrics).reduce((sum, m) => sum + m.successRate, 0) / 3;
  const avgLatency = totalCalls > 0
    ? Object.values(metrics).reduce((sum, m) => sum + (m.avgLatency * m.totalCalls), 0) / totalCalls
    : 0;

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'lovable': return 'hsl(var(--primary))';
      case 'huggingface': return 'hsl(var(--chart-2))';
      case 'browser': return 'hsl(var(--chart-3))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'lovable': return 'default';
      case 'huggingface': return 'secondary';
      case 'browser': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Router Performance</h2>
        <Button variant="outline" size="sm" onClick={resetMetrics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Metrics
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgSuccessRate * 100).toFixed(1)}%</div>
            <Progress value={avgSuccessRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Breakdown</CardTitle>
          <CardDescription>Performance metrics by AI provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(metrics ?? {}).map(([provider, metric]) => (
              <div key={provider} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getProviderBadge(provider) as any}>
                      {provider}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {metric.totalCalls} calls
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {(metric.successRate * 100).toFixed(1)}% success
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latency</p>
                    <p className="font-medium">{metric.avgLatency.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-medium">{metric.failedCalls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium">${metric.totalCost.toFixed(4)}</p>
                  </div>
                </div>

                <Progress 
                  value={metric.successRate * 100} 
                  className="h-2"
                  style={{ 
                    // @ts-ignore
                    '--progress-background': getProviderColor(provider)
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Load Balancing */}
      <Card>
        <CardHeader>
          <CardTitle>Load Distribution</CardTitle>
          <CardDescription>Request distribution across providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(loadBalancing ?? {}).map(([provider, count]) => {
              const percentage = totalCalls > 0 ? (count / totalCalls) * 100 : 0;
              return (
                <div key={provider} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={getProviderBadge(provider) as any}>
                      {provider}
                    </Badge>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Routing Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Speed Priority:</strong> Browser AI is fastest for embeddings and classification</p>
          <p>• <strong>Cost Priority:</strong> Browser AI is free and doesn't consume API credits</p>
          <p>• <strong>Quality Priority:</strong> Lovable AI with Gemini Pro for best results</p>
          <p>• <strong>Privacy Priority:</strong> Browser AI processes everything locally</p>
          <p>• <strong>Fallback Strategy:</strong> Automatic failover ensures high availability</p>
        </CardContent>
      </Card>
    </div>
  );
};
