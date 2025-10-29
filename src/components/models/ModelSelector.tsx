import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Zap, Eye, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Model {
  model_name: string;
  provider: string;
  capabilities: string[];
  cost_per_1k_tokens: number;
  priority: number;
}

interface ModelSelectorProps {
  onModelSelect: (model: string | null, ensembleMode: boolean) => void;
  selectedModel: string | null;
  ensembleMode: boolean;
}

export function ModelSelector({ onModelSelect, selectedModel, ensembleMode }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('available_models')
        .select('model_name, provider, capabilities, cost_per_1k_tokens, priority')
        .eq('is_available', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'reasoning': return <Brain className="w-3 h-3" />;
      case 'creative': return <Zap className="w-3 h-3" />;
      case 'vision': return <Eye className="w-3 h-3" />;
      case 'real-time': return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'anthropic': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'xai': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'google': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Model Selection</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={ensembleMode}
              onCheckedChange={(checked) => onModelSelect(selectedModel, checked)}
            />
            <Label className="text-sm">Ensemble Mode</Label>
          </div>
        </div>

        <Select
          value={selectedModel || 'auto'}
          onValueChange={(value) => onModelSelect(value === 'auto' ? null : value, ensembleMode)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Auto-Select (Intelligent Routing)</span>
              </div>
            </SelectItem>
            {models.map((model) => (
              <SelectItem key={model.model_name} value={model.model_name}>
                <div className="flex items-center gap-2">
                  <span>{model.model_name}</span>
                  <Badge className={getProviderColor(model.provider)} variant="outline">
                    {model.provider}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedModel && (
          <div className="space-y-2">
            {models
              .filter((m) => m.model_name === selectedModel)
              .map((model) => (
                <div key={model.model_name} className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{model.model_name}</span>
                    <Badge className={getProviderColor(model.provider)}>
                      {model.provider}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="gap-1">
                        {getCapabilityIcon(cap)}
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {model.cost_per_1k_tokens} credits/1K
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Priority: {model.priority}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {ensembleMode && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Ensemble Mode:</strong> Uses multiple top models for complex tasks,
              combining their responses for higher accuracy.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
