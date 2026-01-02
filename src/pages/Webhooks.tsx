import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Webhook, Plus, Trash2, Copy, Check, Activity } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface WebhookConfig {
  id?: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
}

const AVAILABLE_EVENTS = [
  'agent.created',
  'agent.updated',
  'agent.deleted',
  'session.started',
  'session.ended',
  'user.subscribed',
  'user.unsubscribed',
  'payment.completed',
];

export default function Webhooks() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState<WebhookConfig>({
    name: '',
    url: '',
    events: [],
    active: true,
  });

  useEffect(() => {
    loadWebhooks();
  }, [user]);

  const loadWebhooks = async () => {
    if (!user) return;

    const { data, error } = (await supabase
      .from('webhooks' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as any;

    if (error) {
      console.error('Error loading webhooks:', error);
      return;
    }

    setWebhooks(data || []);
  };

  const createWebhook = async () => {
    if (!user || !newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`;

    const { error } = (await supabase
      .from('webhooks' as any)
      .insert({
        user_id: user.id,
        name: newWebhook.name,
        url: newWebhook.url,
        secret,
        events: newWebhook.events,
        active: newWebhook.active,
      })) as any;

    if (error) {
      toast.error('Failed to create webhook');
      console.error(error);
      return;
    }

    toast.success('Webhook created successfully');
    setIsDialogOpen(false);
    setNewWebhook({ name: '', url: '', events: [], active: true });
    loadWebhooks();
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    const { error } = (await supabase
      .from('webhooks' as any)
      .update({ active: !active })
      .eq('id', id)) as any;

    if (error) {
      toast.error('Failed to update webhook');
      return;
    }

    toast.success(`Webhook ${!active ? 'enabled' : 'disabled'}`);
    loadWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    const { error } = (await supabase
      .from('webhooks' as any)
      .delete()
      .eq('id', id)) as any;

    if (error) {
      toast.error('Failed to delete webhook');
      return;
    }

    toast.success('Webhook deleted');
    loadWebhooks();
  };

  const copySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AuthGuard featureName="webhook configuration">
    <PageLayout title="Webhooks" showBack={true}>
      <SEO
        title="Webhooks - Real-Time Event Notifications"
        description="Configure webhooks to receive real-time HTTP callbacks when events occur in your account. Monitor agents, sessions, payments, and more with secure webhook integration."
        keywords="webhooks, real-time notifications, HTTP callbacks, event monitoring, API integration"
        canonical="https://oneiros.me/webhooks"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground mt-2">
              Receive real-time HTTP callbacks when events occur in your account
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Webhook Name</Label>
                  <Input
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="Production webhook"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://api.yourapp.com/webhooks"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_EVENTS.map((event) => (
                      <label key={event} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook({
                                ...newWebhook,
                                events: [...newWebhook.events, event],
                              });
                            } else {
                              setNewWebhook({
                                ...newWebhook,
                                events: newWebhook.events.filter((e) => e !== event),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={newWebhook.active}
                    onCheckedChange={(active) => setNewWebhook({ ...newWebhook, active })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createWebhook}>Create Webhook</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Webhook className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{webhook.name}</h3>
                        <Badge variant={webhook.active ? 'default' : 'secondary'}>
                          {webhook.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{webhook.url}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event: string) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}</span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Retries: {webhook.retry_count}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {webhook.secret.substring(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySecret(webhook.secret, webhook.id)}
                      >
                        {copiedId === webhook.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.active}
                    onCheckedChange={() => toggleWebhook(webhook.id, webhook.active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {webhooks.length === 0 && (
            <Card className="p-12 text-center">
              <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No webhooks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first webhook to start receiving real-time event notifications
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
    </AuthGuard>
  );
}
