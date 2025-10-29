import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModelPerformance {
  model_name: string;
  task_type: string;
  success_rate: number;
  avg_latency_ms: number;
  avg_cost_credits: number;
  total_uses: number;
}

export function ModelPerformanceChart() {
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('model_performance')
        .select('*')
        .order('total_uses', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPerformance(data || []);
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const taskTypes = ['all', ...new Set(performance.map(p => p.task_type))];

  const filteredPerformance = selectedTaskType === 'all'
    ? performance
    : performance.filter(p => p.task_type === selectedTaskType);

  // Group by model and average across task types
  const modelSummary = filteredPerformance.reduce((acc, p) => {
    if (!acc[p.model_name]) {
      acc[p.model_name] = {
        model_name: p.model_name,
        success_rate: 0,
        avg_latency_ms: 0,
        avg_cost_credits: 0,
        total_uses: 0,
        count: 0,
      };
    }
    acc[p.model_name].success_rate += p.success_rate;
    acc[p.model_name].avg_latency_ms += p.avg_latency_ms;
    acc[p.model_name].avg_cost_credits += p.avg_cost_credits;
    acc[p.model_name].total_uses += p.total_uses;
    acc[p.model_name].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const summaryData = Object.values(modelSummary).map((m: any) => ({
    model_name: m.model_name,
    success_rate: m.success_rate / m.count,
    avg_latency_ms: m.avg_latency_ms / m.count,
    avg_cost_credits: m.avg_cost_credits / m.count,
    total_uses: m.total_uses,
  })).sort((a, b) => b.total_uses - a.total_uses);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Model Performance</h2>
        </div>
        <div className="flex gap-2">
          {taskTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedTaskType === type ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTaskType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {summaryData.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No performance data yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start using different models to see performance metrics
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaryData.map((model) => (
            <Card key={model.model_name} className="p-4 bg-muted/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{model.model_name}</h3>
                  <Badge variant="outline">{model.total_uses} uses</Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Success Rate</span>
                      </div>
                      <span className="font-medium">
                        {(model.success_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={model.success_rate * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Latency</p>
                        <p className="font-medium">{model.avg_latency_ms.toFixed(0)}ms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Cost</p>
                        <p className="font-medium">{model.avg_cost_credits.toFixed(1)} credits</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
