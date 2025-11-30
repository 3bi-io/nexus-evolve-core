import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Zap, Award, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

interface CreditUsage {
  date: string;
  credits_spent: number;
  credits_remaining: number;
}

interface FeatureUsage {
  feature: string;
  time_spent_minutes: number;
  sessions_count: number;
}

interface UsageStats {
  totalCreditsUsed: number;
  totalTimeSpent: number;
  averageSessionLength: number;
  mostUsedFeature: string;
}

const UsageAnalytics = () => {
  const { user } = useAuth();
  const [creditUsage, setCreditUsage] = useState<CreditUsage[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    totalCreditsUsed: 0,
    totalTimeSpent: 0,
    averageSessionLength: 0,
    mostUsedFeature: 'N/A',
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch credit transactions over time
      const { data: transactions, error: transError } = await supabase
        .from('credit_transactions')
        .select('created_at, credits_amount, balance_after, operation_type')
        .eq('user_id', user.id)
        .eq('transaction_type', 'deduction')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (transError) throw transError;

      // Group by date
      const creditsByDate: Record<string, { spent: number; remaining: number }> = {};
      transactions?.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString();
        if (!creditsByDate[date]) {
          creditsByDate[date] = { spent: 0, remaining: t.balance_after };
        }
        creditsByDate[date].spent += Math.abs(t.credits_amount);
        creditsByDate[date].remaining = t.balance_after;
      });

      const creditData = Object.entries(creditsByDate ?? {}).map(([date, data]) => ({
        date,
        credits_spent: data.spent,
        credits_remaining: data.remaining,
      }));

      setCreditUsage(creditData);

      // Fetch feature usage by session metadata
      const { data: sessions, error: sessionError } = await supabase
        .from('usage_sessions')
        .select('elapsed_seconds, metadata, session_id')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString());

      if (sessionError) throw sessionError;

      // Aggregate by route/feature
      const featureMap: Record<string, { time: number; count: number }> = {};
      
      sessions?.forEach(s => {
        const route = (s.metadata as any)?.route || 'Unknown';
        const feature = route.replace('/', '').replace('-', ' ') || 'Chat';
        
        if (!featureMap[feature]) {
          featureMap[feature] = { time: 0, count: 0 };
        }
        featureMap[feature].time += s.elapsed_seconds;
        featureMap[feature].count += 1;
      });

      const featureData = Object.entries(featureMap ?? {}).map(([feature, data]) => ({
        feature: feature.charAt(0).toUpperCase() + feature.slice(1),
        time_spent_minutes: Math.round(data.time / 60),
        sessions_count: data.count,
      })).sort((a, b) => b.time_spent_minutes - a.time_spent_minutes);

      setFeatureUsage(featureData);

      // Calculate stats
      const totalCredits = creditData.reduce((sum, d) => sum + d.credits_spent, 0);
      const totalTime = sessions?.reduce((sum, s) => sum + s.elapsed_seconds, 0) || 0;
      const avgSession = sessions && sessions.length > 0 
        ? Math.round(totalTime / sessions.length / 60) 
        : 0;
      const mostUsed = featureData[0]?.feature || 'N/A';

      setStats({
        totalCreditsUsed: totalCredits,
        totalTimeSpent: Math.round(totalTime / 60),
        averageSessionLength: avgSession,
        mostUsedFeature: mostUsed,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <AuthGuard featureName="usage analytics">
    <PageLayout title="Usage" showBottomNav={true}>
      <SEO
        title="Usage Analytics - Track Credits, Time & Feature Activity"
        description="Monitor your AI platform usage with detailed analytics. Track credit consumption, time spent, average session length, and feature usage breakdown over 7, 30, or 90 days."
        keywords="usage analytics, credit tracking, usage dashboard, AI analytics, time tracking"
        canonical="https://oneiros.me/usage-analytics"
      />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Usage Analytics</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track your credit usage and feature activity</p>
          </div>
            
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Credits Used</p>
                  <p className="text-3xl font-bold">{stats.totalCreditsUsed}</p>
                </div>
                <Zap className="h-10 w-10 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                  <p className="text-3xl font-bold">{stats.totalTimeSpent}m</p>
                </div>
                <Clock className="h-10 w-10 text-secondary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Session</p>
                  <p className="text-3xl font-bold">{stats.averageSessionLength}m</p>
                </div>
                <TrendingUp className="h-10 w-10 text-accent" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Most Used</p>
                  <p className="text-lg font-bold truncate">{stats.mostUsedFeature}</p>
                </div>
                <Award className="h-10 w-10 text-muted" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Credit Usage Over Time */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Credit Consumption
              </h3>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : creditUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={creditUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="credits_spent" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Credits Spent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </Card>

            {/* Feature Usage Distribution */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Usage
              </h3>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : featureUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ feature, time_spent_minutes }) => 
                        `${feature}: ${time_spent_minutes}m`
                      }
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="time_spent_minutes"
                    >
                      {featureUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No feature usage data available
                </div>
              )}
            </Card>
          </div>

          {/* Feature Details Table */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Feature Breakdown</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : featureUsage.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-left py-3 px-4">Time Spent</th>
                      <th className="text-left py-3 px-4">Sessions</th>
                      <th className="text-left py-3 px-4">Avg per Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureUsage.map((feature, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{feature.feature}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{feature.time_spent_minutes}m</Badge>
                        </td>
                        <td className="py-3 px-4">{feature.sessions_count}</td>
                        <td className="py-3 px-4">
                          {Math.round(feature.time_spent_minutes / feature.sessions_count)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No feature usage data available
              </div>
            )}
          </Card>
        </div>
      </PageLayout>
    </AuthGuard>
  );
};

export default UsageAnalytics;