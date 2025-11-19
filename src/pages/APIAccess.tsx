import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Code,
  BookOpen,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function APIAccess() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      fetchAPIKeys();
    }
  }, [user]);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      // Generate a random API key
      const key = `ok_${Array.from({ length: 32 }, () => 
        Math.random().toString(36)[2]).join('')}`;
      
      const keyPrefix = key.substring(0, 12) + '...';
      
      // Hash the key (in production, use proper hashing)
      const keyHash = btoa(key);

      const { error } = await supabase.from('api_keys').insert({
        user_id: user?.id,
        name: newKeyName,
        key_hash: keyHash,
        key_prefix: keyPrefix,
      });

      if (error) throw error;

      // Show the full key once
      toast.success('API Key Created', {
        description: 'Copy this key now - you won\'t see it again!',
      });
      
      // Copy to clipboard
      navigator.clipboard.writeText(key);
      
      setNewKeyName('');
      fetchAPIKeys();
    } catch (error: any) {
      toast.error('Failed to create API key');
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('API key deleted');
      fetchAPIKeys();
    } catch (error: any) {
      toast.error('Failed to delete API key');
    }
  };

  return (
    <PageLayout title="API Access">
      <SEO
        title="API Access - Oneiros AI"
        description="Integrate Oneiros AI into your applications with our developer API"
        keywords="API, developer, integration, REST API"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">API Access</h1>
          <p className="text-muted-foreground mt-2">
            Integrate Oneiros AI into your applications
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <Activity className="h-4 w-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-6">
            {/* Create API Key */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Create New API Key</h2>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter key name (e.g., Production App)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateAPIKey()}
                    className="flex-1"
                  />
                  <Button onClick={generateAPIKey}>Generate Key</Button>
                </div>
              </div>
            </Card>

            {/* API Keys List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your API Keys</h3>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No API keys yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first API key to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{key.name}</span>
                          {key.is_active ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                          <span>{key.key_prefix}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(key.key_prefix);
                              toast.success('Copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && ` • Last used: ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Getting Started</h2>
                <p className="text-muted-foreground">
                  Integrate Oneiros AI into your application with our RESTful API
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                  <Card className="p-4 bg-muted/50">
                    <code className="text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <Card className="p-4 bg-muted/50">
                    <code className="text-sm">
                      https://api.oneiros.ai/v1
                    </code>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                  <Card className="p-4 bg-muted/50">
                    <pre className="text-sm overflow-x-auto">
{`curl https://api.oneiros.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, AI!",
    "model": "auto"
  }'`}
                    </pre>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
                  <div className="space-y-2">
                    {[
                      { method: 'POST', path: '/chat', desc: 'Send a chat message' },
                      { method: 'GET', path: '/models', desc: 'List available models' },
                      { method: 'POST', path: '/embeddings', desc: 'Generate embeddings' },
                      { method: 'POST', path: '/images', desc: 'Generate images' },
                      { method: 'GET', path: '/usage', desc: 'Check API usage' },
                    ].map((endpoint) => (
                      <Card key={endpoint.path} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{endpoint.method}</Badge>
                            <code className="text-sm">{endpoint.path}</code>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {endpoint.desc}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">API Usage Analytics</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">0</p>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">--</p>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">-- ms</p>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-6">
                Make your first API request to see usage analytics
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
