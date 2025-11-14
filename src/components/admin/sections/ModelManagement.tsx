import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Cpu } from "lucide-react";
import { useAdminAudit } from "@/hooks/useAdminAudit";

export function ModelManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logAction } = useAdminAudit();

  const { data: models, isLoading } = useQuery({
    queryKey: ['admin', 'available-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_models')
        .select('*')
        .order('provider', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ modelId, isAvailable }: { modelId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('available_models')
        .update({ is_available: isAvailable })
        .eq('id', modelId);
      if (error) throw error;
      return { modelId, isAvailable };
    },
    onSuccess: async ({ modelId, isAvailable }) => {
      await logAction({
        action_type: 'toggle_model_availability',
        target_type: 'available_model',
        target_id: modelId,
        details: { is_available: isAvailable }
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'available-models'] });
      toast({ title: `Model ${isAvailable ? 'enabled' : 'disabled'}` });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Model Management</h2>
        <p className="text-muted-foreground">Configure AI model availability and pricing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {models?.filter(m => m.is_available).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(models?.map(m => m.provider)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Models</CardTitle>
          <CardDescription>Manage model availability across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead>Cost/1K Tokens</TableHead>
                <TableHead>Streaming</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models?.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <Badge variant="outline">{model.provider}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{model.model_name}</TableCell>
                  <TableCell>{model.max_tokens?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>${model.cost_per_1k_tokens || 'Free'}</TableCell>
                  <TableCell>
                    {model.supports_streaming ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={model.is_available ? 'default' : 'secondary'}>
                      {model.is_available ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={model.is_available || false}
                      onCheckedChange={(checked) => toggleAvailabilityMutation.mutate({
                        modelId: model.id,
                        isAvailable: checked
                      })}
                      disabled={toggleAvailabilityMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
