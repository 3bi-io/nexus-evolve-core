import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Image, Download } from 'lucide-react';
import { ApplyAIBadge } from './ApplyAIBadge';

export function ImageGenerationStudio() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [numImages, setNumImages] = useState([1]);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate images',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('xai-image-generator', {
        body: {
          prompt,
          negativePrompt: negativePrompt || undefined,
          numImages: numImages[0],
        },
      });

      if (error) throw error;

      setGeneratedImages(data.images);
      toast({
        title: 'Images Generated!',
        description: `Created ${data.images.length} images successfully`,
      });
    } catch (error: any) {
      console.error('Image generation error:', error);
      
      // Handle specific error types
      const errorMessage = error?.message || 'Failed to generate images';
      const isRateLimit = errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit');
      const isPaymentRequired = errorMessage.includes('402') || errorMessage.toLowerCase().includes('credits') || errorMessage.toLowerCase().includes('payment');
      
      if (isRateLimit) {
        toast({
          title: 'Rate Limit Reached',
          description: 'Too many requests. Please wait a moment and try again.',
          variant: 'destructive',
        });
      } else if (isPaymentRequired) {
        toast({
          title: 'Insufficient Credits',
          description: 'You need more credits to generate images. Please upgrade your plan.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Image Generator</h2>
          <p className="text-sm text-muted-foreground">Powered by Grok 2 Image</p>
        </div>
        <ApplyAIBadge variant="compact" />
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative">Negative Prompt (Optional)</Label>
          <Input
            id="negative"
            placeholder="What to avoid in the image..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Images: {numImages[0]}</Label>
          <Slider
            value={numImages}
            onValueChange={setNumImages}
            min={1}
            max={4}
            step={1}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="mr-2 h-4 w-4" />
              Generate Images
            </>
          )}
        </Button>
      </Card>

      {generatedImages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Generated ${idx + 1}`}
                  className="w-full rounded-lg"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => window.open(url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
