import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAIRouter, TaskType, RouterOptions } from "@/hooks/useUnifiedAIRouter";
import { Loader2, Zap, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function UnifiedRouterDemo() {
  const { executeAI, metrics, getLoadBalancing, resetMetrics, loading } = useUnifiedAIRouter();
  const [task, setTask] = useState<TaskType>("chat");
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<"speed" | "cost" | "quality" | "privacy">("quality");
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    if (!input.trim()) {
      toast.error("Please enter input text");
      return;
    }

    try {
      const options: RouterOptions = {
        priority,
        maxCost: priority === "cost" ? 0.0005 : undefined,
        maxLatency: priority === "speed" ? 1500 : undefined,
      };

      const response = await executeAI(task, input, options);
      setResult(response);
    } catch (error) {
      console.error("Execution failed:", error);
    }
  };

  const loadBalancing = getLoadBalancing;

  return (
    <PageLayout title="Unified AI Router Demo" showBack={true}>
      <SEO 
        title="Unified AI Router Demo - Test Intelligent AI Routing"
        description="Interactive demo of our unified AI router. Test routing decisions based on priority (speed, cost, quality, privacy). Real-time metrics and performance tracking."
        keywords="unified router, AI routing demo, router testing, routing metrics"
        canonical="https://oneiros.me/unified-router-demo"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configure Request</CardTitle>
              <CardDescription>Set task type, priority, and input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select value={task} onValueChange={(v) => setTask(v as TaskType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat / Text Generation</SelectItem>
                    <SelectItem value="embedding">Embeddings</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="image-gen">Image Generation</SelectItem>
                    <SelectItem value="object-detection">Object Detection</SelectItem>
                    <SelectItem value="captioning">Image Captioning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speed">Speed (Fastest)</SelectItem>
                    <SelectItem value="cost">Cost (Cheapest)</SelectItem>
                    <SelectItem value="quality">Quality (Best)</SelectItem>
                    <SelectItem value="privacy">Privacy (Browser)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your input text here..."
                  rows={6}
                />
              </div>

              <Button onClick={handleExecute} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Execute AI Task"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {result.provider}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {result.latency.toFixed(0)}ms
                  </Badge>
                  <Badge variant="outline">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {result.cost.toFixed(4)} credits
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <strong>Model:</strong> {result.model}
                  </div>
                  <div className="text-sm">
                    <strong>Output:</strong>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-64">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metrics Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Provider Metrics</CardTitle>
                  <CardDescription>Real-time performance tracking</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={resetMetrics}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.values(metrics).map((provider) => (
                  <div key={provider.provider} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{provider.provider}</h4>
                      <Badge variant={provider.totalCalls > 0 ? "default" : "outline"}>
                        {provider.totalCalls} calls
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">
                          {(provider.successRate * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Latency</div>
                        <div className="font-medium">{provider.avgLatency.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Cost</div>
                        <div className="font-medium">{provider.totalCost.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Load Balancing</CardTitle>
              <CardDescription>Distribution across providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(loadBalancing ?? {}).map(([provider, percentage]) => (
                  <div key={provider} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{provider}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Zap className="w-5 h-5 inline mr-2" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Intelligent provider selection based on task and priority</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Automatic WebGPU detection for browser AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Smart fallback to alternative providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Real-time metrics and performance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Cost and latency optimization</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </PageLayout>
  );
}
