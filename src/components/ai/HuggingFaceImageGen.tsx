import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Image as ImageIcon, DollarSign } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

export function HuggingFaceImageGen() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [costCredits, setCostCredits] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('stabilityai/stable-diffusion-xl-base-1.0');
  const [provider, setProvider] = useState<'lovable' | 'huggingface'>('huggingface');

  const handleModelSelect = (modelId: string, modelProvider: 'lovable' | 'huggingface') => {
    setSelectedModel(modelId);
    setProvider(modelProvider);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedImage(null);
    const startTime = Date.now();

    try {
      if (provider === 'huggingface') {
        // Call HuggingFace inference
        const { data, error } = await supabase.functions.invoke('huggingface-inference', {
          body: {
            modelId: selectedModel,
            task: 'text-to-image',
            inputs: prompt,
            parameters: {
              num_inference_steps: 50,
              guidance_scale: 7.5,
            },
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        setGeneratedImage(data.result.image);
        setGenerationTime(data.latency_ms);
        setCostCredits(data.cost_credits);

        toast({
          title: "Image generated!",
          description: `Generated in ${(data.latency_ms / 1000).toFixed(1)}s using ${selectedModel.split('/')[1]}`,
        });
      } else {
        // Call Lovable AI (Gemini image generation)
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { prompt },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setGeneratedImage(data.image);
        setGenerationTime(Date.now() - startTime);
        setCostCredits(0.01); // Estimated cost for Lovable AI

        toast({
          title: "Image generated!",
          description: `Generated in ${((Date.now() - startTime) / 1000).toFixed(1)}s using Lovable AI`,
        });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `hf-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Model Selector */}
      <div className="lg:col-span-1">
        <ModelSelector
          task="text-to-image"
          selectedModel={selectedModel}
          onSelectModel={handleModelSelect}
        />
      </div>

      {/* Input and Controls */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Image Generation
            </CardTitle>
            <CardDescription>
              Generate high-quality images using AI - Choose your provider and model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Image Description</Label>
                <Badge variant="outline">
                  {provider === 'huggingface' ? 'HuggingFace' : 'Lovable AI'}
                </Badge>
              </div>
              <Textarea
                id="prompt"
                placeholder="A serene mountain landscape at sunset, photorealistic, 4k resolution, beautiful lighting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Be descriptive! Include style, mood, lighting, and quality descriptors for best results.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Image Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Image</CardTitle>
                {generationTime && (
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span>⚡ {(generationTime / 1000).toFixed(1)}s</span>
                    {costCredits !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {costCredits.toFixed(4)} credits
                      </span>
                    )}
                  </CardDescription>
                )}
              </div>
              {generatedImage && !loading && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="aspect-square bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Generating your image...
                  </p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="AI Generated"
                  className="w-full rounded-lg shadow-lg border"
                />
                {prompt && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
                    <p className="text-sm">{prompt}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Generated image will appear here</p>
                <p className="text-xs mt-2">
                  Select a model and enter a prompt to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
