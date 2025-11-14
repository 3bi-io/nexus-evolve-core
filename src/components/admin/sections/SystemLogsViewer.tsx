import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Search } from "lucide-react";
import { format } from "date-fns";

export function SystemLogsViewer() {
  const [search, setSearch] = useState("");

  const { data: evolutionLogs, isLoading: evolutionLoading } = useQuery({
    queryKey: ['admin', 'evolution-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evolution_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: cronLogs, isLoading: cronLoading } = useQuery({
    queryKey: ['admin', 'cron-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: memoryLogs, isLoading: memoryLoading } = useQuery({
    queryKey: ['admin', 'memory-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memory_pruning_logs')
        .select('*')
        .order('pruned_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  if (evolutionLoading || cronLoading || memoryLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
        <p className="text-muted-foreground">View system operations and debugging logs</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="evolution">
        <TabsList>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
          <TabsTrigger value="cron">Cron Jobs</TabsTrigger>
          <TabsTrigger value="memory">Memory Pruning</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Logs</CardTitle>
              <CardDescription>System evolution and learning events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {evolutionLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.log_type}</TableCell>
                  <TableCell>
                    <Badge variant={log.success ? 'default' : 'destructive'}>
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                    {log.description}
                  </TableCell>
                  <TableCell>{format(new Date(log.created_at), 'MMM d, HH:mm:ss')}</TableCell>
                </TableRow>
              ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cron Job Logs</CardTitle>
              <CardDescription>Scheduled task execution history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Executed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cronLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.job_name}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                  <TableCell>{log.duration_ms ? `${log.duration_ms}ms` : 'N/A'}</TableCell>
                  <TableCell>{format(new Date(log.ended_at || log.created_at), 'MMM d, HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Pruning Logs</CardTitle>
              <CardDescription>Memory cleanup operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memories Deleted</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoryLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold">{log.pruned_count}</TableCell>
                      <TableCell>{log.threshold_used}</TableCell>
                      <TableCell>{format(new Date(log.created_at), 'MMM d, HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
