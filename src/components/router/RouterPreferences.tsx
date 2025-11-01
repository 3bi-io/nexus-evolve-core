import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEnterpriseRouter, RouterPreferences as PrefsType } from '@/hooks/useEnterpriseRouter';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const RouterPreferences = () => {
  const { preferences, savePreferences, loading } = useEnterpriseRouter();
  const [localPrefs, setLocalPrefs] = useState<PrefsType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    } else {
      setLocalPrefs({
        default_priority: 'quality',
        preferred_providers: [],
        blocked_providers: [],
        custom_rules: []
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    setSaving(true);
    await savePreferences(localPrefs);
    setSaving(false);
  };

  const addPreferredProvider = (provider: string) => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      preferred_providers: [...localPrefs.preferred_providers, provider]
    });
  };

  const removePreferredProvider = (provider: string) => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      preferred_providers: localPrefs.preferred_providers.filter(p => p !== provider)
    });
  };

  const addBlockedProvider = (provider: string) => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      blocked_providers: [...localPrefs.blocked_providers, provider]
    });
  };

  const removeBlockedProvider = (provider: string) => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      blocked_providers: localPrefs.blocked_providers.filter(p => p !== provider)
    });
  };

  if (loading || !localPrefs) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const providers = ['lovable', 'huggingface', 'browser'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Router Preferences</CardTitle>
        <CardDescription>
          Customize routing behavior and set global constraints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Default Priority</Label>
          <Select
            value={localPrefs.default_priority}
            onValueChange={(v: any) => setLocalPrefs({ ...localPrefs, default_priority: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speed">Speed</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Max Cost Per Request ($)</Label>
          <Input
            type="number"
            step="0.0001"
            placeholder="No limit"
            value={localPrefs.max_cost_per_request || ''}
            onChange={(e) => setLocalPrefs({
              ...localPrefs,
              max_cost_per_request: e.target.value ? parseFloat(e.target.value) : undefined
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Latency (ms)</Label>
          <Input
            type="number"
            placeholder="No limit"
            value={localPrefs.max_latency_ms || ''}
            onChange={(e) => setLocalPrefs({
              ...localPrefs,
              max_latency_ms: e.target.value ? parseInt(e.target.value) : undefined
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Cost Alert Threshold ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="No alerts"
            value={localPrefs.cost_alert_threshold || ''}
            onChange={(e) => setLocalPrefs({
              ...localPrefs,
              cost_alert_threshold: e.target.value ? parseFloat(e.target.value) : undefined
            })}
          />
          <p className="text-xs text-muted-foreground">
            Get notified when daily spending exceeds this amount
          </p>
        </div>

        <div className="space-y-2">
          <Label>Preferred Providers</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {localPrefs.preferred_providers.map(provider => (
              <Badge key={provider} variant="secondary" className="flex items-center gap-1">
                {provider}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removePreferredProvider(provider)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={addPreferredProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Add provider..." />
            </SelectTrigger>
            <SelectContent>
              {providers
                .filter(p => !localPrefs.preferred_providers.includes(p))
                .map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Prioritize these providers when routing
          </p>
        </div>

        <div className="space-y-2">
          <Label>Blocked Providers</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {localPrefs.blocked_providers.map(provider => (
              <Badge key={provider} variant="destructive" className="flex items-center gap-1">
                {provider}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeBlockedProvider(provider)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={addBlockedProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Block provider..." />
            </SelectTrigger>
            <SelectContent>
              {providers
                .filter(p => !localPrefs.blocked_providers.includes(p))
                .map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Never route to these providers
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
