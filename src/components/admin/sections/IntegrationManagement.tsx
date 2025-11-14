import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export function IntegrationManagement() {
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['admin', 'user-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: triggers, isLoading: triggersLoading } = useQuery({
    queryKey: ['admin', 'integration-triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_triggers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const activeIntegrations = integrations?.filter(i => i.is_active).length || 0;
  const totalTriggers = triggers?.length || 0;

  if (integrationsLoading || triggersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integration Management</h2>
        <p className="text-muted-foreground">Monitor external service connections</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeIntegrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Webhook Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTriggers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Integrations</CardTitle>
          <CardDescription>Connected external services</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations?.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Plug className="h-4 w-4" />
                    {integration.integration_type}
                  </TableCell>
                  <TableCell>
                    {integration.is_active ? (
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {integration.last_triggered_at
                      ? format(new Date(integration.last_triggered_at), 'MMM d, HH:mm')
                      : 'Never'}
                  </TableCell>
                  <TableCell>{format(new Date(integration.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Triggers</CardTitle>
          <CardDescription>Recent webhook and automation triggers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger Type</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggers?.map((trigger) => (
                <TableRow key={trigger.id}>
                  <TableCell className="font-medium">{trigger.integration_id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {trigger.status}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trigger.status === 'success' ? 'default' : 'destructive'}>
                      {trigger.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(trigger.created_at), 'MMM d, HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
