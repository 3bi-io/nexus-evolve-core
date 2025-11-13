import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoading } from '@/components/ui/loading-state';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdvancedAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch user events
      const { count: eventCount } = await supabase
        .from('user_events')
        .select('*', { count: 'exact', head: true });

      // Fetch feature usage
      const { data: featureData } = await supabase
        .from('feature_usage')
        .select('*');

      setStats({
        totalEvents: eventCount || 0,
        activeUsers: featureData?.length || 0,
        totalSessions: 0,
        avgSessionDuration: 0,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventData = [
    { name: 'Mon', events: 120 },
    { name: 'Tue', events: 180 },
    { name: 'Wed', events: 220 },
    { name: 'Thu', events: 190 },
    { name: 'Fri', events: 250 },
    { name: 'Sat', events: 280 },
    { name: 'Sun', events: 200 },
  ];

  const featureUsageData = [
    { name: 'Chat', value: 400 },
    { name: 'Image Gen', value: 300 },
    { name: 'Browser AI', value: 200 },
    { name: 'Voice', value: 100 },
  ];

  const retentionData = [
    { day: 'Day 1', retention: 100 },
    { day: 'Day 7', retention: 75 },
    { day: 'Day 14', retention: 60 },
    { day: 'Day 30', retention: 45 },
  ];

  return (
    <AppLayout title="Advanced Analytics" showBottomNav>
      <SEO
        title="Advanced Analytics - Oneiros AI"
        description="Deep insights into user behavior and platform performance"
        keywords="analytics, insights, metrics, dashboard"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Deep insights into user behavior and platform performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-primary" />
              <Badge variant="secondary">+12%</Badge>
            </div>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-primary" />
              <Badge variant="secondary">+8%</Badge>
            </div>
            <p className="text-3xl font-bold">{stats.activeUsers}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <MessageSquare className="h-8 w-8 text-primary" />
              <Badge variant="secondary">+15%</Badge>
            </div>
            <p className="text-3xl font-bold">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-primary" />
              <Badge variant="secondary">+5%</Badge>
            </div>
            <p className="text-3xl font-bold">{stats.avgSessionDuration}m</p>
            <p className="text-sm text-muted-foreground">Avg Session</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Feature Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {featureUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Feature Usage Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Retention Curve</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 space-y-3">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-3xl font-bold">250ms</p>
                <p className="text-sm text-muted-foreground">Average API response</p>
              </Card>

              <Card className="p-6 space-y-3">
                <Target className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Success Rate</h3>
                <p className="text-3xl font-bold">99.8%</p>
                <p className="text-sm text-muted-foreground">Request success rate</p>
              </Card>

              <Card className="p-6 space-y-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Uptime</h3>
                <p className="text-3xl font-bold">99.99%</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
