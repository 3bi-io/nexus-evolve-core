import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundRemover } from "@/components/ai/BackgroundRemover";
import { ModelCacheViewer } from "@/components/ai/ModelCacheViewer";
import { BrowserEmbeddings } from "@/components/ai/BrowserEmbeddings";
import { IntentClassifier } from "@/components/ai/IntentClassifier";
import { ObjectDetector } from "@/components/ai/ObjectDetector";
import { ImageCaptioning } from "@/components/ai/ImageCaptioning";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Zap, HardDrive } from "lucide-react";

const AdvancedBrowserAI = () => {
  return (
    <AppLayout title="Advanced Browser AI" showBottomNav>
      <SEO
        title="Advanced Browser AI - Privacy-First AI Image Processing"
        description="Advanced AI image processing in your browser. Background removal, object detection, captioning, embeddings - all 100% private and free. WebGPU-accelerated with smart caching."
        keywords="browser AI, WebGPU, background removal, object detection, image captioning, embeddings, privacy AI"
        canonical="https://oneiros.me/advanced-browser-ai"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="detection">Detection</TabsTrigger>
            <TabsTrigger value="captioning">Captioning</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="background" className="space-y-4">
            <BackgroundRemover />
            <p className="text-sm text-muted-foreground">
              Upload an image and remove its background using AI segmentation, all processed locally in your browser.
            </p>
          </TabsContent>

          <TabsContent value="detection" className="space-y-4">
            <ObjectDetector />
            <p className="text-sm text-muted-foreground">
              Detect and locate objects in images using the DETR model, running entirely in your browser.
            </p>
          </TabsContent>

          <TabsContent value="captioning" className="space-y-4">
            <ImageCaptioning />
            <p className="text-sm text-muted-foreground">
              Generate natural language descriptions of images using Vision Transformer and GPT-2.
            </p>
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
    </AppLayout>
  );
};

export default AdvancedBrowserAI;
