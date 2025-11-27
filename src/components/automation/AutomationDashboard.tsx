import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Pause, Plus, Activity, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

export function AutomationDashboard() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePipelines: 0,
    activeMonitors: 0,
    pendingContent: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load pipelines
      const { data: pipelinesData } = await supabase
        .from('automation_pipelines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load monitors
      const { data: monitorsData } = await supabase
        .from('scheduled_monitors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load content queue
      const { data: queueData } = await supabase
        .from('content_generation_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .limit(20);

      // Calculate cache hit rate
      const { data: cacheData } = await supabase
        .from('ai_response_cache')
        .select('hit_count')
        .gte('expires_at', new Date().toISOString());

      const totalHits = cacheData?.reduce((sum, item) => sum + (item.hit_count || 0), 0) || 0;
      const totalRequests = cacheData?.length || 0;
      const cacheHitRate = totalRequests > 0 ? totalHits / (totalHits + totalRequests) : 0;

      setPipelines(pipelinesData || []);
      setMonitors(monitorsData || []);
      setContentQueue(queueData || []);

      // Calculate stats
      setStats({
        activePipelines: pipelinesData?.filter(p => p.is_active).length || 0,
        activeMonitors: monitorsData?.filter(m => m.is_active).length || 0,
        pendingContent: queueData?.filter(q => q.status === 'pending').length || 0,
        cacheHitRate,
      });
    } catch (error) {
      console.error('Failed to load automation data:', error);
      toast.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const togglePipeline = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_pipelines')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Pipeline ${!isActive ? 'activated' : 'paused'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to toggle pipeline');
    }
  };

  const runPipeline = async (id: string) => {
    try {
      toast.info('Starting pipeline execution...');
      const { data, error } = await supabase.functions.invoke('automation-pipeline-executor', {
        body: { pipelineId: id, manualRun: true },
      });

      if (error) throw error;
      toast.success('Pipeline executed successfully');
      loadData();
    } catch (error) {
      toast.error('Pipeline execution failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading automation dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePipelines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMonitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Content</CardTitle>
            <Zap className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingContent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.cacheHitRate * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipelines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
          <TabsTrigger value="content">Content Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Automation Pipelines</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Pipeline
            </Button>
          </div>

          <div className="grid gap-4">
            {pipelines.map((pipeline) => (
              <Card key={pipeline.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{pipeline.name}</CardTitle>
                      <CardDescription>{pipeline.description}</CardDescription>
                    </div>
                    <Badge variant={pipeline.is_active ? 'default' : 'secondary'}>
                      {pipeline.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <div>Success: {pipeline.success_count} | Failed: {pipeline.failure_count}</div>
                      {pipeline.last_run_at && (
                        <div className="text-muted-foreground">
                          Last run: {new Date(pipeline.last_run_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runPipeline(pipeline.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePipeline(pipeline.id, pipeline.is_active)}
                      >
                        {pipeline.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Scheduled Monitors</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Monitor
            </Button>
          </div>

          <div className="grid gap-4">
            {monitors.map((monitor) => (
              <Card key={monitor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{monitor.target}</CardTitle>
                      <CardDescription>
                        Type: {monitor.monitor_type} | Schedule: {monitor.schedule_cron}
                      </CardDescription>
                    </div>
                    <Badge variant={monitor.is_active ? 'default' : 'secondary'}>
                      {monitor.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {monitor.last_run_at && (
                    <div className="text-sm text-muted-foreground">
                      Last run: {new Date(monitor.last_run_at).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Content Generation Queue</h3>
          </div>

          <div className="grid gap-4">
            {contentQueue.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.content_type}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.prompt}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'default'
                          : item.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority: {item.priority}</span>
                    {item.created_at && (
                      <span className="text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
