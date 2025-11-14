import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitBranch, AlertTriangle, Activity } from "lucide-react";
import { format } from "date-fns";

export function RouterManagement() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'router-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('router_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: costAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['admin', 'router-cost-alerts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('router_cost_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: abTests, isLoading: testsLoading } = useQuery({
    queryKey: ['admin', 'router-ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('router_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const activeTests = abTests?.filter(t => t.active).length || 0;

  if (analyticsLoading || alertsLoading || testsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Router Management</h2>
        <p className="text-muted-foreground">AI routing system analytics and control</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Cost Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{costAlerts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              A/B Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTests} active</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Router Analytics</CardTitle>
          <CardDescription>Recent routing decisions and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Selected Model</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.model_used}</TableCell>
                  <TableCell>{route.latency_ms}ms</TableCell>
                  <TableCell>${route.cost?.toFixed(4) || '0'}</TableCell>
                  <TableCell>
                    <Badge variant={route.success ? 'default' : 'destructive'}>
                      {route.success ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(route.created_at), 'MMM d, HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Alerts</CardTitle>
          <CardDescription>Active cost monitoring alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Type</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costAlerts?.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.alert_type}</TableCell>
                  <TableCell>${alert.threshold_amount}</TableCell>
                  <TableCell className="text-red-600 font-bold">
                    ${alert.current_amount}
                  </TableCell>
                  <TableCell>{format(new Date(alert.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
