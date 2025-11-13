import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { useMobile } from '@/hooks/useMobile';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, DollarSign, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

export default function LLMAnalytics() {
  const { user } = useAuth();
  const { isMobile } = useMobile();

  const { data: agentPerformance, refetch: refetchAgentPerformance } = useQuery({
    queryKey: ['agent-performance', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('llm_observations')
        .select('agent_type, latency_ms, cost_usd, model_used')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      // Aggregate by agent type
      const aggregated = data?.reduce((acc: any, obs) => {
        if (!acc[obs.agent_type]) {
          acc[obs.agent_type] = { 
            agent: obs.agent_type,
            avgLatency: 0, 
            totalCost: 0, 
            count: 0 
          };
        }
        acc[obs.agent_type].avgLatency += obs.latency_ms || 0;
        acc[obs.agent_type].totalCost += obs.cost_usd || 0;
        acc[obs.agent_type].count += 1;
        return acc;
      }, {});
      
      return Object.values(aggregated || {}).map((a: any) => ({
        ...a,
        avgLatency: Math.round(a.avgLatency / a.count)
      }));
    },
    enabled: !!user
  });

  const { data: modelUsage, refetch: refetchModelUsage } = useQuery({
    queryKey: ['model-usage', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('llm_observations')
        .select('model_used')
        .eq('user_id', user!.id);
      
      const usage = data?.reduce((acc: any, obs) => {
        acc[obs.model_used] = (acc[obs.model_used] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(usage || {}).map(([name, value]) => ({
        name: name.split('/')[1] || name,
        value
      }));
    },
    enabled: !!user
  });

  const { data: costOverTime, refetch: refetchCostOverTime } = useQuery({
    queryKey: ['cost-over-time', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('llm_observations')
        .select('created_at, cost_usd')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true })
        .limit(50);

      return data?.map(d => ({
        date: new Date(d.created_at).toLocaleDateString(),
        cost: d.cost_usd
      }));
    },
    enabled: !!user
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['llm-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('llm_observations')
        .select('cost_usd, latency_ms')
        .eq('user_id', user!.id);

      const totalCost = data?.reduce((sum, obs) => sum + (obs.cost_usd || 0), 0) || 0;
      const avgLatency = data?.reduce((sum, obs) => sum + (obs.latency_ms || 0), 0) / (data?.length || 1);
      const totalCalls = data?.length || 0;

      return {
        totalCost: totalCost.toFixed(4),
        avgLatency: Math.round(avgLatency),
        totalCalls
      };
    },
    enabled: !!user
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  const handleRefresh = async () => {
    await Promise.all([
      refetchAgentPerformance(),
      refetchModelUsage(),
      refetchCostOverTime(),
      refetchStats()
    ]);
  };

  const content = (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">LLM Analytics</h1>
          <p className="text-muted-foreground">Monitor AI model performance and costs</p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleRefresh}
          className="hidden md:flex"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalCost || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Last 100 calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgLatency || 0}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">API requests made</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Latency by Agent</CardTitle>
            <CardDescription>Response time comparison across agents</CardDescription>
          </CardHeader>
          <CardContent>
            {agentPerformance && agentPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformance}>
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgLatency" fill="hsl(var(--primary))" name="Avg Latency (ms)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Activity}
                title="No data yet"
                description="Start using AI agents to see analytics"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cost by Agent</CardTitle>
            <CardDescription>Cost distribution across agent types</CardDescription>
          </CardHeader>
          <CardContent>
            {agentPerformance && agentPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformance}>
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCost" fill="hsl(var(--accent))" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Start using AI agents to see analytics.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
            <CardDescription>Which models are being used</CardDescription>
          </CardHeader>
          <CardContent>
            {modelUsage && modelUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Start using AI agents to see analytics.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Over Time</CardTitle>
            <CardDescription>Track spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            {costOverTime && costOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Start using AI agents to see analytics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <AppLayout title="LLM Analytics" showBottomNav>
      <SEO
        title="LLM Analytics - Performance & Cost Tracking"
        description="Track AI model performance, costs, and usage patterns. Optimize your AI agent performance with detailed observability."
        keywords="LLM analytics, AI performance, model costs, observability, agent monitoring"
      />
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </AppLayout>
  );
}
