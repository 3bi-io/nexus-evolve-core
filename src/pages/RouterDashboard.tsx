import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { RouterMetricsDashboard } from '@/components/ai/RouterMetricsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedRouter } from '@/hooks/useAdvancedRouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

const RouterDashboard = () => {
  const { routeTask, executeWithFallback } = useAdvancedRouter();
  const { toast } = useToast();
  const [testTask, setTestTask] = useState<'chat' | 'embedding' | 'classification'>('chat');
  const [priority, setPriority] = useState<'speed' | 'cost' | 'quality' | 'privacy'>('quality');
  const [testInput, setTestInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestRoute = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some test input",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const decision = routeTask(testTask, { priority });
      
      // Simulate execution
      const mockExecute = async () => {
        await new Promise(resolve => setTimeout(resolve, decision.estimatedLatency));
        return { success: true, mockData: `Processed: ${testInput}` };
      };

      const result = await executeWithFallback(testTask, async () => mockExecute(), { priority });

      setTestResult({
        ...result,
        decision
      });

      toast({
        title: "Test Complete",
        description: `Routed to ${result.provider} successfully`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <PageLayout title="Router Dashboard" showBack={true}>
      <SEO 
        title="Router Dashboard - AI Routing Performance & Optimization"
        description="Monitor and optimize AI routing performance across multiple providers. Test routing logic, track metrics, and configure intelligent failover strategies."
        keywords="AI routing, performance monitoring, provider optimization, router metrics"
        canonical="https://oneiros.me/router-dashboard"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Router Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor AI routing performance and optimize provider selection
            </p>
          </div>
        </div>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="test">Test Router</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <RouterMetricsDashboard />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Routing Logic</CardTitle>
                <CardDescription>
                  Test how tasks are routed based on different priorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <Select value={testTask} onValueChange={(v: any) => setTestTask(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="embedding">Embedding</SelectItem>
                        <SelectItem value="classification">Classification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
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
                </div>

                <div className="space-y-2">
                  <Label>Test Input</Label>
                  <Input
                    placeholder="Enter test input..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleTestRoute} 
                  disabled={testing}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Route'}
                </Button>

                {testResult && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6 space-y-3">
                      <div>
                        <span className="font-semibold">Provider: </span>
                        <span className="text-primary">{testResult.provider}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Model: </span>
                        {testResult.decision.model}
                      </div>
                      <div>
                        <span className="font-semibold">Reason: </span>
                        {testResult.decision.reason}
                      </div>
                      <div>
                        <span className="font-semibold">Latency: </span>
                        {testResult.latency}ms
                      </div>
                      <div>
                        <span className="font-semibold">Cost: </span>
                        ${testResult.cost.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-semibold">Fallbacks: </span>
                        {testResult.decision.fallbacks.join(', ') || 'None'}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Router Configuration</CardTitle>
                <CardDescription>
                  Advanced routing settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold">Routing Strategies</h3>
                  <p>• <strong>Speed Priority:</strong> Routes to fastest provider based on historical latency</p>
                  <p>• <strong>Cost Priority:</strong> Prefers free browser AI, then lowest-cost APIs</p>
                  <p>• <strong>Quality Priority:</strong> Uses highest-quality models (Gemini Pro, FLUX.1)</p>
                  <p>• <strong>Privacy Priority:</strong> Routes to browser AI for local processing</p>
                </div>

                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold">Fallback Logic</h3>
                  <p>• Automatic failover to backup providers on error</p>
                  <p>• Retry with alternative models if primary fails</p>
                  <p>• Smart degradation to maintain service availability</p>
                  <p>• Success rate tracking influences future routing</p>
                </div>

                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold">Load Balancing</h3>
                  <p>• Distributes requests across available providers</p>
                  <p>• Tracks provider health and success rates</p>
                  <p>• Adjusts routing based on performance metrics</p>
                  <p>• Prevents overloading single provider</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default RouterDashboard;
