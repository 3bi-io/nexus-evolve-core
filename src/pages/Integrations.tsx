import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Webhook, Activity, Plus, Trash2, Play, ExternalLink } from "lucide-react";

export default function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewIntegration, setShowNewIntegration] = useState(false);

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['user-integrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch trigger history
  const { data: triggers } = useQuery({
    queryKey: ['integration-triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_triggers')
        .select('*, user_integrations(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (integration: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_integrations')
        .insert({ ...integration, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      toast({ title: "Integration created successfully" });
      setShowNewIntegration(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      toast({ title: "Integration deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data, error } = await supabase.functions.invoke('trigger-integration', {
        body: {
          integrationId,
          data: { test: true, message: 'Test trigger from Integrations page' },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-triggers'] });
      toast({ title: "Test trigger sent successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Connect Zapier, Make.com, and custom webhooks
            </p>
          </div>
          <Button onClick={() => setShowNewIntegration(!showNewIntegration)}>
            <Plus className="w-4 h-4 mr-2" />
            New Integration
          </Button>
        </div>

        {showNewIntegration && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <NewIntegrationForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setShowNewIntegration(false)}
              />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="integrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="integrations">My Integrations</TabsTrigger>
            <TabsTrigger value="history">Trigger History</TabsTrigger>
            <TabsTrigger value="setup">Setup Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading integrations...
                </CardContent>
              </Card>
            ) : integrations && integrations.length > 0 ? (
              integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{integration.name}</CardTitle>
                          <Badge variant={integration.is_active ? "default" : "secondary"}>
                            {integration.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {integration.integration_type}
                          </Badge>
                        </div>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                      <Switch
                        checked={integration.is_active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: integration.id, is_active: checked })
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Triggered {integration.trigger_count} times</span>
                        {integration.last_triggered_at && (
                          <span className="text-muted-foreground">
                            Last: {new Date(integration.last_triggered_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testMutation.mutate(integration.id)}
                          disabled={!integration.is_active}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(integration.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first integration to connect with Zapier, Make.com, or custom webhooks
                  </p>
                  <Button onClick={() => setShowNewIntegration(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Integration
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {triggers && triggers.length > 0 ? (
              triggers.map((trigger: any) => (
                <Card key={trigger.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trigger.user_integrations?.name}</span>
                          <Badge variant={trigger.status === 'success' ? 'default' : 'destructive'}>
                            {trigger.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trigger.created_at).toLocaleString()}
                          {trigger.execution_time_ms && ` • ${trigger.execution_time_ms}ms`}
                        </p>
                        {trigger.error_message && (
                          <p className="text-sm text-destructive">{trigger.error_message}</p>
                        )}
                      </div>
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No trigger history yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <SetupGuides />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function NewIntegrationForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    integration_type: 'zapier',
    name: '',
    description: '',
    webhook_url: '',
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Integration Type</Label>
        <Select
          value={formData.integration_type}
          onValueChange={(value) => setFormData({ ...formData, integration_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zapier">Zapier</SelectItem>
            <SelectItem value="make">Make.com</SelectItem>
            <SelectItem value="webhook">Custom Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          required
          placeholder="My Zapier Integration"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="What does this integration do?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <Input
          required
          type="url"
          placeholder="https://hooks.zapier.com/..."
          value={formData.webhook_url}
          onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Create Integration</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SetupGuides() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <CardTitle>Zapier Setup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Zapier and create a new Zap</li>
            <li>Select "Webhooks by Zapier" as the trigger</li>
            <li>Choose "Catch Hook" as the trigger event</li>
            <li>Copy the webhook URL provided</li>
            <li>Create an integration here with that URL</li>
            <li>Test your integration to send sample data</li>
          </ol>
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Zapier
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            <CardTitle>Make.com Setup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Make.com and create a new scenario</li>
            <li>Add a "Webhook" module as the trigger</li>
            <li>Choose "Custom webhook"</li>
            <li>Copy the webhook URL provided</li>
            <li>Create an integration here with that URL</li>
            <li>Test your integration to send sample data</li>
          </ol>
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <a href="https://make.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Make.com
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
