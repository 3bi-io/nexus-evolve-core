import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Zap, DollarSign } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ApplyAIBadge } from '@/components/xai/ApplyAIBadge';

export default function XAIAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: analytics } = await supabase
        .from('xai_usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (analytics) {
        const summary = {
          totalRequests: analytics.length,
          successRate: analytics.filter(a => a.success).length / analytics.length,
          avgLatency: analytics.reduce((acc, a) => acc + (a.latency_ms || 0), 0) / analytics.length,
          totalCost: analytics.reduce((acc, a) => acc + (a.cost_credits || 0), 0),
          byModel: analytics.reduce((acc: any, a) => {
            acc[a.model_id] = (acc[a.model_id] || 0) + 1;
            return acc;
          }, {}),
          byFeature: analytics.reduce((acc: any, a) => {
            acc[a.feature_type] = (acc[a.feature_type] || 0) + 1;
            return acc;
          }, {}),
        };
        setStats(summary);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container max-w-7xl py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!stats) {
    return (
      <PageLayout>
        <div className="container max-w-7xl py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO 
        title="XAI Analytics - Usage & Performance Metrics"
        description="Track your XAI usage, performance metrics, and costs across all Grok-powered features"
        keywords="XAI analytics, AI usage, performance metrics, cost tracking"
        canonical="https://oneiros.me/xai-analytics"
      />
      <div className="container max-w-7xl py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">XAI Analytics</h1>
            <p className="text-muted-foreground">
              Track your usage and performance metrics
            </p>
          </div>
          <ApplyAIBadge variant="full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{stats.avgLatency.toFixed(0)}ms</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usage by Model</h3>
            <div className="space-y-2">
              {Object.entries(stats.byModel).map(([model, count]: [string, any]) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="text-sm">{model}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usage by Feature</h3>
            <div className="space-y-2">
              {Object.entries(stats.byFeature).map(([feature, count]: [string, any]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{feature.replace(/-/g, ' ')}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
