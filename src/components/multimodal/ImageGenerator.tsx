import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Sparkles } from "lucide-react";

export function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const styles = [
    { value: "realistic", label: "Realistic" },
    { value: "artistic", label: "Artistic" },
    { value: "cartoon", label: "Cartoon" },
    { value: "anime", label: "Anime" },
    { value: "cinematic", label: "Cinematic" },
    { value: "abstract", label: "Abstract" },
  ];

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

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.image);
      setGenerationTime(data.generationTime);

      toast({
        title: "Image generated!",
        description: `Generated in ${(data.generationTime / 1000).toFixed(1)}s`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Handle specific error types
      const errorMessage = error?.message || 'Failed to generate image';
      const isRateLimit = errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit');
      const isPaymentRequired = errorMessage.includes('402') || errorMessage.toLowerCase().includes('credits') || errorMessage.toLowerCase().includes('payment');
      
      if (isRateLimit) {
        toast({
          title: "Rate Limit Reached",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (isPaymentRequired) {
        toast({
          title: "Insufficient Credits",
          description: "You need more credits to generate images. Please upgrade your plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Image Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality images using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Description</Label>
            <Textarea
              id="prompt"
              placeholder="A beautiful sunset over mountains with a lake in the foreground..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle} disabled={loading}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Image</CardTitle>
          {generationTime && (
            <CardDescription>
              Generated in {(generationTime / 1000).toFixed(1)} seconds
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="aspect-square bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : generatedImage ? (
            <div className="space-y-4">
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full rounded-lg shadow-lg"
              />
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </div>
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Generated image will appear here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
