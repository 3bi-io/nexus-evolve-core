import { PageLayout } from "@/components/layout/PageLayout";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrowserEmbeddings } from "@/components/ai/BrowserEmbeddings";
import { IntentClassifier } from "@/components/ai/IntentClassifier";
import { BrowserSpeechRecognition } from "@/components/ai/BrowserSpeechRecognition";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Shield } from "lucide-react";

const BrowserAI = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Browser AI - Lovable AI</title>
        <meta name="description" content="Run AI models directly in your browser with WebGPU acceleration" />
      </Helmet>

      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold">Browser AI</h1>
            <Badge variant="secondary">Phase 3</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Run AI models directly in your browser with WebGPU acceleration. Private, fast, and cost-effective.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 mt-1" />
                <div>
                  <h3 className="font-semibold">100% Private</h3>
                  <p className="text-sm text-muted-foreground">Data never leaves your device</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 mt-1" />
                <div>
                  <h3 className="font-semibold">Instant Response</h3>
                  <p className="text-sm text-muted-foreground">No network latency</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 mt-1" />
                <div>
                  <h3 className="font-semibold">Zero Cost</h3>
                  <p className="text-sm text-muted-foreground">No API calls or credits used</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="embeddings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="intent">Intent Classification</TabsTrigger>
            <TabsTrigger value="speech">Speech Recognition</TabsTrigger>
          </TabsList>

          <TabsContent value="embeddings" className="space-y-4">
            <BrowserEmbeddings />
          </TabsContent>

          <TabsContent value="intent" className="space-y-4">
            <IntentClassifier />
          </TabsContent>

          <TabsContent value="speech" className="space-y-4">
            <BrowserSpeechRecognition />
          </TabsContent>
        </Tabs>

        <Card className="p-6 bg-muted">
          <h3 className="font-semibold mb-2">Requirements</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Modern browser with WebGPU support (Chrome 113+, Edge 113+)</li>
            <li>• First load downloads models (~50-200MB depending on model)</li>
            <li>• Models are cached locally for subsequent uses</li>
            <li>• Automatic fallback to server if WebGPU unavailable</li>
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BrowserAI;
