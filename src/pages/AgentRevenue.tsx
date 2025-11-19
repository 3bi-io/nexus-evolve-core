import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, TrendingUp, Users, Star, Download } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AgentRevenue() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (user) {
      loadAgentRevenue();
      loadPurchases();
    }
  }, [user]);

  const loadAgentRevenue = async () => {
    if (!user) return;

    const { data, error } = (await supabase
      .from('custom_agents' as any)
      .select('*')
      .eq('creator_id', user.id)
      .neq('pricing_model', 'free')
      .order('total_revenue', { ascending: false })) as any;

    if (error) {
      console.error('Error loading agents:', error);
      return;
    }

    setAgents(data || []);
    const total = data?.reduce((sum: number, agent: any) => sum + Number(agent.total_revenue || 0), 0) || 0;
    setTotalRevenue(total);
  };

  const loadPurchases = async () => {
    if (!user) return;

    const { data, error } = (await supabase
      .from('agent_purchases' as any)
      .select('*, custom_agents(name)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)) as any;

    if (error) {
      console.error('Error loading purchases:', error);
      return;
    }

    setPurchases(data || []);
    setTotalSales(data?.length || 0);
  };

  const exportData = () => {
    const csv = [
      ['Agent Name', 'Pricing Model', 'Price', 'Total Sales', 'Total Revenue', 'Revenue Share'],
      ...agents.map(agent => [
        agent.name,
        agent.pricing_model,
        agent.price_amount,
        agent.usage_count,
        agent.total_revenue,
        `${agent.revenue_share_percent}%`,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-revenue-report.csv';
    a.click();
    toast.success('Report downloaded');
  };

  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#10B981', '#3B82F6'];

  const revenueByAgent = agents.map(agent => ({
    name: agent.name,
    revenue: Number(agent.total_revenue || 0),
  }));

  const revenueOverTime = purchases
    .reduce((acc: any[], purchase) => {
      const date = new Date(purchase.created_at).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.revenue += Number(purchase.seller_payout);
      } else {
        acc.push({
          date,
          revenue: Number(purchase.seller_payout),
        });
      }
      
      return acc;
    }, [])
    .slice(-30);

  return (
    <PageLayout title="Agent Revenue" showBack={true}>
      <SEO
        title="Agent Revenue - Track Marketplace Earnings & Sales"
        description="Monitor revenue and sales from your published AI agents in the marketplace. Track earnings, analyze performance, and export detailed revenue reports with 70% creator share."
        keywords="agent revenue, marketplace earnings, creator payouts, agent monetization"
        canonical="https://oneiros.me/agent-revenue"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Revenue</h1>
            <p className="text-muted-foreground mt-2">
              Monitor earnings from your agent marketplace
            </p>
          </div>

          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">
                  {(agents.reduce((sum, a) => sum + (a.rating_avg || 0), 0) / agents.length || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Revenue by Agent</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByAgent}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {revenueByAgent.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Agent List */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Your Agents</h3>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{agent.name}</h4>
                    <Badge variant="outline" className="capitalize">
                      {agent.pricing_model}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold">${agent.price_amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Sales</p>
                    <p className="font-semibold">{agent.usage_count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-green-600">${Number(agent.total_revenue).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Share</p>
                    <p className="font-semibold">{agent.revenue_share_percent}%</p>
                  </div>
                </div>
              </div>
            ))}

            {agents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No paid agents yet</p>
                <p className="text-sm mt-2">Publish agents with pricing to start earning revenue</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
