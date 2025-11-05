import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Cpu, Zap, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Model {
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
  className?: string;
}

export function ModelSelector({ 
  task = 'text-generation', 
  selectedModel, 
  onSelectModel,
  className 
}: ModelSelectorProps) {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, [task]);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('huggingface_models')
        .select('*')
        .eq('task', task)
        .eq('active', true)
        .order('cost_per_1k_tokens', { ascending: true });

      if (error) throw error;
      setModels(data || []);
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

  const lovableModels = {
    'text-generation': [
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', cost: 0.001, speed: 'Fast' },
      { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', cost: 0.0005, speed: 'Fastest' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', cost: 0.005, speed: 'Medium' },
      { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', cost: 0.002, speed: 'Fast' },
      { id: 'openai/gpt-5', name: 'GPT-5', cost: 0.01, speed: 'Slow' },
    ],
    'text-to-image': [
      { id: 'google/gemini-2.5-flash-image', name: 'Gemini Image', cost: 0.01, speed: 'Fast' },
    ],
    'feature-extraction': [],
  };

  const currentLovableModels = lovableModels[task];
  const formatCost = (cost: number) => cost < 0.001 ? `$${(cost * 1000).toFixed(4)}/1k` : `$${cost.toFixed(4)}/1k`;
  const formatParams = (count: number) => count >= 1e9 ? `${(count / 1e9).toFixed(1)}B` : `${(count / 1e6).toFixed(1)}M`;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          AI Model Selection
        </CardTitle>
        <CardDescription>
          Choose between Lovable AI Gateway and HuggingFace models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lovable AI Models */}
        {currentLovableModels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold">Lovable AI Gateway</span>
              <Badge variant="secondary">Pre-configured</Badge>
            </div>
            <div className="grid gap-2">
              {currentLovableModels.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  className="justify-between h-auto p-3"
                  onClick={() => onSelectModel(model.id, 'lovable')}
                >
                  <div className="text-left">
                    <div className="font-medium">{model.name}</div>
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

        {/* HuggingFace Models */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading HuggingFace models...
          </div>
        ) : models.length > 0 ? (
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
              {models.map((model) => (
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
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No HuggingFace models available for {task}
          </div>
        )}

        {/* Quick Select Dropdown */}
        <div className="pt-4 border-t">
          <Select value={selectedModel} onValueChange={(value) => {
            const isHF = models.some(m => m.model_id === value);
            onSelectModel(value, isHF ? 'huggingface' : 'lovable');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Quick select model" />
            </SelectTrigger>
            <SelectContent>
              {currentLovableModels.length > 0 && (
                <>
                  <SelectItem value="lovable-header" disabled className="font-semibold">
                    Lovable AI
                  </SelectItem>
                  {currentLovableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({formatCost(model.cost)})
                    </SelectItem>
                  ))}
                </>
              )}
              {models.length > 0 && (
                <>
                  <SelectItem value="hf-header" disabled className="font-semibold">
                    HuggingFace
                  </SelectItem>
                  {models.map((model) => (
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
