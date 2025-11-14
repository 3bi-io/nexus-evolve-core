import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Workflow, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export function WorkflowManagement() {
  const { data: pipelines, isLoading: pipelinesLoading } = useQuery({
    queryKey: ['admin', 'automation-pipelines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_pipelines')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: executions, isLoading: executionsLoading } = useQuery({
    queryKey: ['admin', 'pipeline-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const activePipelines = pipelines?.filter(p => p.is_active).length || 0;
  const successRate = executions?.length
    ? (executions.filter(e => e.status === 'success').length / executions.length) * 100
    : 0;

  if (pipelinesLoading || executionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workflow Management</h2>
        <p className="text-muted-foreground">Monitor automation pipelines</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePipelines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Pipelines</CardTitle>
          <CardDescription>Configured workflow automations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success/Failure</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines?.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell className="font-medium">{pipeline.name}</TableCell>
                  <TableCell>
                    <Badge variant={pipeline.is_active ? 'default' : 'secondary'}>
                      {pipeline.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">{pipeline.success_count || 0}</span>
                    {' / '}
                    <span className="text-red-600">{pipeline.failure_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    {pipeline.last_run_at
                      ? format(new Date(pipeline.last_run_at), 'MMM d, HH:mm')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {pipeline.next_run_at
                      ? format(new Date(pipeline.next_run_at), 'MMM d, HH:mm')
                      : 'Not scheduled'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest pipeline runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Executed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions?.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    {execution.status === 'success' ? (
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{execution.duration_ms}ms</TableCell>
                  <TableCell>{format(new Date(execution.completed_at || execution.started_at), 'MMM d, HH:mm:ss')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
