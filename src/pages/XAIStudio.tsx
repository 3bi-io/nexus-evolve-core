import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerationStudio } from '@/components/xai/ImageGenerationStudio';
import { VisionAnalyzer } from '@/components/xai/VisionAnalyzer';
import { GrokCodeAnalyzer } from '@/components/xai/GrokCodeAnalyzer';
import { ReasoningAssistant } from '@/components/xai/ReasoningAssistant';
import { MultiModalWorkflows } from '@/components/xai/MultiModalWorkflows';
import { TrustIndicators } from '@/components/xai/TrustIndicators';
import { Sparkles, Image, Eye, Code, Brain, Workflow, LayoutDashboard } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function XAIStudio() {
  const navigate = useNavigate();

  return (
    <AppLayout title="XAI Studio" showBottomNav>
      <SEO
        title="XAI Studio - Advanced AI Tools powered by Grok"
        description="Access cutting-edge AI capabilities including image generation, vision analysis, code review, and deep reasoning powered by Grok from @applyai"
        keywords="XAI, Grok, AI tools, image generation, vision AI, code analysis, reasoning AI"
        canonical="https://oneiros.me/xai-studio"
      />
      <div className="container max-w-7xl py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">XAI Studio</h1>
              <p className="text-muted-foreground">
                Advanced AI tools powered by Grok from @applyai
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/xai-dashboard')}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            View All Features
          </Button>
        </div>

        <TrustIndicators />

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="image-gen" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Gen
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Reasoning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows">
            <MultiModalWorkflows />
          </TabsContent>

          <TabsContent value="image-gen">
            <ImageGenerationStudio />
          </TabsContent>

          <TabsContent value="vision">
            <VisionAnalyzer />
          </TabsContent>

          <TabsContent value="code">
            <GrokCodeAnalyzer />
          </TabsContent>

          <TabsContent value="reasoning">
            <ReasoningAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
