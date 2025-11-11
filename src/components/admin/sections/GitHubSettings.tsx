import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Github, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface GitHubConfig {
  github_repo_url: string;
  github_base_branch: string;
  github_auto_pr: boolean;
}

export function GitHubSettings() {
  const [config, setConfig] = useState<GitHubConfig>({
    github_repo_url: '',
    github_base_branch: 'main',
    github_auto_pr: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('platform_optimizer_config')
        .select('github_repo_url, github_base_branch, github_auto_pr')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          github_repo_url: data.github_repo_url || '',
          github_base_branch: data.github_base_branch || 'main',
          github_auto_pr: data.github_auto_pr || false,
        });
      }
    } catch (error: any) {
      console.error('Error loading GitHub config:', error);
      toast.error('Failed to load GitHub configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('platform_optimizer_config')
        .upsert({
          user_id: user.id,
          github_repo_url: config.github_repo_url,
          github_base_branch: config.github_base_branch,
          github_auto_pr: config.github_auto_pr,
        });

      if (error) throw error;

      toast.success('GitHub configuration saved');
    } catch (error: any) {
      console.error('Error saving GitHub config:', error);
      toast.error('Failed to save GitHub configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.github_repo_url) {
      toast.error('Please enter a repository URL');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('unknown');

    try {
      const { data, error } = await supabase.functions.invoke('github-pr-creator', {
        body: {
          test: true,
          repoUrl: config.github_repo_url,
        },
      });

      if (error) throw error;

      if (data.success) {
        setConnectionStatus('connected');
        toast.success('GitHub connection successful!');
      } else {
        setConnectionStatus('error');
        toast.error(data.error || 'Connection test failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      toast.error('Failed to test connection');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Configure automatic pull request creation for approved improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        {config.github_repo_url && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {connectionStatus === 'connected' && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Connection Error
              </Badge>
            )}
            {connectionStatus === 'unknown' && (
              <Badge variant="secondary">Not Tested</Badge>
            )}
          </div>
        )}

        {/* Repository URL */}
        <div className="space-y-2">
          <Label htmlFor="repo-url">Repository URL</Label>
          <Input
            id="repo-url"
            placeholder="owner/repository"
            value={config.github_repo_url}
            onChange={(e) => setConfig({ ...config, github_repo_url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Format: owner/repository (e.g., oneiros/platform)
          </p>
        </div>

        {/* Base Branch */}
        <div className="space-y-2">
          <Label htmlFor="base-branch">Base Branch</Label>
          <Input
            id="base-branch"
            placeholder="main"
            value={config.github_base_branch}
            onChange={(e) => setConfig({ ...config, github_base_branch: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            PRs will be created against this branch
          </p>
        </div>

        {/* Auto PR Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-pr">Auto-create PRs</Label>
            <p className="text-xs text-muted-foreground">
              Automatically create PRs when improvements are approved
            </p>
          </div>
          <Switch
            id="auto-pr"
            checked={config.github_auto_pr}
            onCheckedChange={(checked) => setConfig({ ...config, github_auto_pr: checked })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={testConnection} variant="outline" disabled={isTesting || !config.github_repo_url}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button onClick={saveConfig} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="text-sm space-y-2">
            <p className="font-medium">Required GitHub Token Scopes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><code>repo</code> - Full control of private repositories</li>
              <li><code>workflow</code> - Update GitHub Action workflows (optional)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              The GitHub token is securely stored in Supabase and used only for creating pull requests.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
