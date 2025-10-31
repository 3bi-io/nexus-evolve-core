import { PageLayout } from "@/components/layout/PageLayout";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundRemover } from "@/components/ai/BackgroundRemover";
import { ModelCacheViewer } from "@/components/ai/ModelCacheViewer";
import { BrowserEmbeddings } from "@/components/ai/BrowserEmbeddings";
import { IntentClassifier } from "@/components/ai/IntentClassifier";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Zap, HardDrive } from "lucide-react";

const AdvancedBrowserAI = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Advanced Browser AI - Lovable AI</title>
        <meta name="description" content="Advanced AI processing in your browser with background removal, embeddings, and more" />
      </Helmet>

      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold">Advanced Browser AI</h1>
            <Badge variant="secondary">Phase 3B</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Powerful AI image processing and analysis directly in your browser. 
            Private, fast, and completely free.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 mt-1 text-purple-500" />
                <div>
                  <h3 className="font-semibold">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">State-of-the-art models</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 mt-1 text-green-500" />
                <div>
                  <h3 className="font-semibold">100% Private</h3>
                  <p className="text-sm text-muted-foreground">Images never leave device</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 mt-1 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">Instant</h3>
                  <p className="text-sm text-muted-foreground">No network latency</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 mt-1 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Smart Cache</h3>
                  <p className="text-sm text-muted-foreground">Models cached locally</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="background">Background Removal</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="cache">Model Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="background" className="space-y-4">
            <BackgroundRemover />
            
            <Card className="p-6 bg-muted">
              <h3 className="font-semibold mb-3">How it works</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Upload an image (stays in your browser)</p>
                <p>2. AI model segments the subject from background</p>
                <p>3. Background is removed, creating transparent PNG</p>
                <p>4. Download your processed image</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="embeddings" className="space-y-4">
            <BrowserEmbeddings />
          </TabsContent>

          <TabsContent value="classification" className="space-y-4">
            <IntentClassifier />
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <ModelCacheViewer />
            
            <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <h3 className="font-semibold mb-2">About Model Caching</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Models are downloaded on first use and cached in your browser's IndexedDB. 
                  This means the first time you use a feature takes longer (downloading the model),
                  but subsequent uses are instant.
                </p>
                <p>
                  Cache is persistent across sessions and stored locally on your device.
                  You can clear it anytime using the "Clear Cache" button above.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-6 bg-muted">
          <h3 className="font-semibold mb-2">Browser Requirements</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Chrome 113+ or Edge 113+ (for WebGPU support)</li>
            <li>• First load downloads models (50-200MB depending on feature)</li>
            <li>• Subsequent uses load instantly from cache</li>
            <li>• All processing happens locally - no data sent to servers</li>
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdvancedBrowserAI;
