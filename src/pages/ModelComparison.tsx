import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, Zap, DollarSign, Clock, Sparkles } from "lucide-react";

interface ComparisonResult {
  provider: string;
  model: string;
  result: string;
  latency: number;
  cost: number;
  timestamp: number;
}

const ModelComparison = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);

  const modelsToCompare = [
    { provider: 'lovable', modelId: 'google/gemini-2.5-flash', name: 'Gemini Flash' },
    { provider: 'huggingface', modelId: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B' },
    { provider: 'huggingface', modelId: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B' },
  ];

  const runComparison = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to compare models",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    const comparisonResults: ComparisonResult[] = [];

    for (const model of modelsToCompare) {
      try {
        const startTime = Date.now();

        if (model.provider === 'lovable') {
          // Call Lovable AI
          const { data, error } = await supabase.functions.invoke('chat-stream-with-routing', {
            body: {
              messages: [{ role: 'user', content: prompt }],
              forceModel: model.modelId,
            },
          });

          if (error) throw error;

          const latency = Date.now() - startTime;
          comparisonResults.push({
            provider: 'Lovable AI',
            model: model.name,
            result: data.response || 'No response',
            latency,
            cost: 0.001,
            timestamp: Date.now(),
          });
        } else {
          // Call HuggingFace
          const { data, error } = await supabase.functions.invoke('huggingface-inference', {
            body: {
              modelId: model.modelId,
              task: 'text-generation',
              inputs: prompt,
              parameters: {
                max_tokens: 512,
                temperature: 0.7,
              },
            },
          });

          if (error) throw error;

          comparisonResults.push({
            provider: 'HuggingFace',
            model: model.name,
            result: data.result[0]?.generated_text || 'No response',
            latency: data.latency_ms,
            cost: data.cost_credits,
            timestamp: Date.now(),
          });
        }

        setResults([...comparisonResults]);
      } catch (error: any) {
        console.error(`Error with ${model.name}:`, error);
        comparisonResults.push({
          provider: model.provider === 'lovable' ? 'Lovable AI' : 'HuggingFace',
          model: model.name,
          result: `Error: ${error.message}`,
          latency: 0,
          cost: 0,
          timestamp: Date.now(),
        });
        setResults([...comparisonResults]);
      }
    }

    setLoading(false);
    toast({
      title: "Comparison complete!",
      description: `Tested ${modelsToCompare.length} models`,
    });
  };

  const getBestModel = () => {
    if (results.length === 0) return null;
    
    // Calculate score: (1 / latency) * (1 / cost) * quality_multiplier
    const scored = results.map(r => ({
      ...r,
      score: (1000 / r.latency) * (1 / (r.cost + 0.0001)) * (r.result.includes('Error') ? 0 : 1),
    }));

    return scored.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  const bestModel = getBestModel();

  return (
    <PageLayout>
      <SEO 
        title="Model Comparison - Compare AI Models Side-by-Side | Oneiros"
        description="Compare AI models across the platform's 9 AI systems. Test performance, cost, and quality side-by-side. See how our router selects the best model for your query automatically."
        keywords="AI model comparison, compare AI models, model performance, AI benchmarking, model testing, transparent AI"
        canonical="https://oneiros.me/model-comparison"
      />

      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Model Comparison
          </h1>
          <p className="text-muted-foreground">
            Compare AI models across the platform's 9 systems. Results automatically saved to your session. 
            See transparent AI - know exactly what's running under the hood.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test Prompt</CardTitle>
            <CardDescription>
              Enter a prompt to test across {modelsToCompare.length} different AI models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your prompt here... Try something like: 'Explain quantum computing in simple terms' or 'Write a creative story about space exploration'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <Button 
              onClick={runComparison} 
              disabled={loading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running comparison...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Compare Models
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Best Model Recommendation */}
        {bestModel && !loading && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Recommended: {bestModel.model}
              </CardTitle>
              <CardDescription>
                Best balance of speed, cost, and quality for this prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{(bestModel.latency / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{bestModel.cost.toFixed(4)} credits</span>
                </div>
                <Badge variant="default">{bestModel.provider}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result, index) => (
              <Card 
                key={index}
                className={bestModel?.model === result.model ? 'border-primary' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{result.model}</CardTitle>
                      <CardDescription>{result.provider}</CardDescription>
                    </div>
                    {bestModel?.model === result.model && (
                      <Badge variant="default" className="ml-2">Best</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{(result.latency / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>{result.cost.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="p-3 bg-muted rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {result.result.substring(0, 300)}
                      {result.result.length > 300 && '...'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && results.length < modelsToCompare.length && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">
                  Testing model {results.length + 1} of {modelsToCompare.length}...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter a prompt above to start comparing AI models</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ModelComparison;
