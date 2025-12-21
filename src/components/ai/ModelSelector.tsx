import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Cpu, Zap, DollarSign, Brain, Eye, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LOVABLE_MODELS, getModelsByTask, formatCost } from "@/config/models";

interface HuggingFaceModel {
  id: string;
  model_id: string;
  task: string;
  display_name: string;
  description: string;
  parameters_count: number;
  license: string;
  cost_per_1k_tokens: number;
  metadata: any;
}

interface ModelSelectorProps {
  task?: 'text-generation' | 'text-to-image' | 'feature-extraction';
  selectedModel: string;
  onSelectModel: (modelId: string, provider: 'lovable' | 'huggingface') => void;
  ensembleMode?: boolean;
  onEnsembleModeChange?: (enabled: boolean) => void;
  className?: string;
}

export function ModelSelector({ 
  task = 'text-generation', 
  selectedModel, 
  onSelectModel,
  ensembleMode = false,
  onEnsembleModeChange,
  className 
}: ModelSelectorProps) {
  const { toast } = useToast();
  const [hfModels, setHfModels] = useState<HuggingFaceModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHuggingFaceModels();
  }, [task]);

  const fetchHuggingFaceModels = async () => {
    try {
      const { data, error } = await supabase
        .from('huggingface_models')
        .select('*')
        .eq('task', task)
        .eq('active', true)
        .order('cost_per_1k_tokens', { ascending: true });

      if (error) throw error;
      setHfModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: "Failed to load models",
        description: "Using default models only",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const lovableModels = getModelsByTask(task);
  const formatParams = (count: number) => count >= 1e9 ? `${(count / 1e9).toFixed(1)}B` : `${(count / 1e6).toFixed(1)}M`;

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
      case 'google': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const selectedModelInfo = Object.values(LOVABLE_MODELS).find(m => m.id === selectedModel);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              AI Model Selection
            </CardTitle>
            <CardDescription>
              Choose between Lovable AI Gateway and HuggingFace models
            </CardDescription>
          </div>
          {onEnsembleModeChange && (
            <div className="flex items-center gap-2">
              <Switch
                checked={ensembleMode}
                onCheckedChange={onEnsembleModeChange}
              />
              <Label className="text-sm">Ensemble</Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lovable AI Models */}
        {lovableModels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold">Lovable AI Gateway</span>
              <Badge variant="secondary">Pre-configured</Badge>
            </div>
            <div className="grid gap-2">
              {lovableModels.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  className="justify-between h-auto p-3"
                  onClick={() => onSelectModel(model.id, 'lovable')}
                >
                  <div className="text-left">
                    <div className="font-medium flex items-center gap-2">
                      {model.name}
                      <Badge className={getProviderColor(model.provider)} variant="outline">
                        {model.provider}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCost(model.cost)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {model.speed}
                      </span>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Model Details */}
        {selectedModelInfo && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{selectedModelInfo.name}</span>
              <Badge className={getProviderColor(selectedModelInfo.provider)}>
                {selectedModelInfo.provider}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{selectedModelInfo.description}</p>
            <div className="flex flex-wrap gap-1">
              {selectedModelInfo.capabilities.map((cap) => (
                <Badge key={cap} variant="outline" className="gap-1 text-xs">
                  {getCapabilityIcon(cap)}
                  {cap}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCost(selectedModelInfo.cost)}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {selectedModelInfo.speed}
              </div>
            </div>
          </div>
        )}

        {/* HuggingFace Models */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading HuggingFace models...
          </div>
        ) : hfModels.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="https://huggingface.co/front/assets/huggingface_logo.svg" 
                alt="HuggingFace" 
                className="w-4 h-4"
              />
              <span className="font-semibold">HuggingFace Models</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                60-90% cheaper
              </Badge>
            </div>
            <div className="grid gap-2">
              {hfModels.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel === model.model_id ? "default" : "outline"}
                  className="justify-between h-auto p-3"
                  onClick={() => onSelectModel(model.model_id, 'huggingface')}
                >
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{model.display_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCost(model.cost_per_1k_tokens)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {formatParams(model.parameters_count)}
                      </span>
                      <span className="text-muted-foreground">
                        {model.license}
                      </span>
                    </div>
                  </div>
                  {selectedModel === model.model_id && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Ensemble Mode Info */}
        {ensembleMode && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Ensemble Mode:</strong> Uses multiple top models for complex tasks,
              combining their responses for higher accuracy.
            </p>
          </div>
        )}

        {/* Quick Select Dropdown */}
        <div className="pt-4 border-t">
          <Select value={selectedModel} onValueChange={(value) => {
            const isHF = hfModels.some(m => m.model_id === value);
            onSelectModel(value, isHF ? 'huggingface' : 'lovable');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Quick select model" />
            </SelectTrigger>
            <SelectContent>
              {lovableModels.length > 0 && (
                <>
                  <SelectItem value="lovable-header" disabled className="font-semibold">
                    Lovable AI
                  </SelectItem>
                  {lovableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({formatCost(model.cost)})
                    </SelectItem>
                  ))}
                </>
              )}
              {hfModels.length > 0 && (
                <>
                  <SelectItem value="hf-header" disabled className="font-semibold">
                    HuggingFace
                  </SelectItem>
                  {hfModels.map((model) => (
                    <SelectItem key={model.id} value={model.model_id}>
                      {model.display_name} ({formatCost(model.cost_per_1k_tokens)})
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
