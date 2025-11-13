import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { AIProviderDashboard } from "@/components/ai/AIProviderDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useUnifiedAIRouter, TaskType } from "@/hooks/useUnifiedAIRouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const AIHub = () => {
  const { executeAI, loading } = useUnifiedAIRouter();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  const testRouter = async (task: TaskType) => {
    if (!input.trim()) return;

    try {
      const response = await executeAI(task, input.trim());
      setResult(response);
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  return (
    <AppLayout title="AI Hub" showBottomNav>
      <SEO
        title="AI Hub - Unified AI Access with Intelligent Routing"
        description="Unified access to Lovable AI, HuggingFace, and Browser AI with intelligent routing. Smart AI provider selection across the unified platform's 9 systems."
        keywords="AI hub, AI routing, unified AI, intelligent routing, AI providers, multi-AI platform"
        canonical="https://oneiros.me/ai-hub"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Hub</h1>
          <p className="text-xl text-muted-foreground">
            Unified access to Lovable AI, HuggingFace, and Browser AI with intelligent routing
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="test">Test Router</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AIProviderDashboard />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Test Smart AI Router</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter text and test different AI tasks. The router will automatically select the best provider.
                  </p>
                </div>

                <Textarea
                  placeholder="Enter your text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => testRouter("chat")}
                    disabled={loading || !input.trim()}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate Text
                  </Button>
                  <Button
                    onClick={() => testRouter("embedding")}
                    disabled={loading || !input.trim()}
                    variant="secondary"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Embeddings
                  </Button>
                  <Button
                    onClick={() => testRouter("classification")}
                    disabled={loading || !input.trim()}
                    variant="outline"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Classify Sentiment
                  </Button>
                </div>

                {result && (
                  <Card className="p-4 space-y-3 bg-muted">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Result</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{result.provider}</Badge>
                        <Badge variant="outline">{result.latency.toFixed(0)}ms</Badge>
                        <Badge variant="outline">${result.cost.toFixed(4)}</Badge>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Model: {result.model}</p>
                      <div className="bg-background p-3 rounded-lg max-h-60 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AIHub;
