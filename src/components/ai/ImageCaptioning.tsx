import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline } from '@huggingface/transformers';

export const ImageCaptioning = () => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const captioner = await pipeline(
        'image-to-text',
        'Xenova/vit-gpt2-image-captioning',
        { device: 'webgpu' }
      );

      const result = await captioner(image, {
        max_new_tokens: 50,
      });

      // Handle both output formats from transformers.js
      let text = '';
      if (Array.isArray(result)) {
        const firstResult = result[0];
        text = (firstResult as any)?.generated_text || '';
      } else {
        text = (result as any)?.generated_text || '';
      }
      setCaption(text);
      toast({
        title: "Caption Generated!",
        description: "Image caption created successfully",
      });
    } catch (error) {
      console.error('Captioning error:', error);
      toast({
        title: "Captioning Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Captioning</CardTitle>
        <CardDescription>
          Generate natural language descriptions of images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <label className="cursor-pointer w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </span>
            </Button>
          </label>

          {image && (
            <div className="w-full">
              <img
                src={image}
                alt="Upload"
                className="w-full rounded-lg border"
              />
            </div>
          )}

          {image && (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Caption...
                </>
              ) : (
                'Generate Caption'
              )}
            </Button>
          )}

          {caption && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Caption:</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{caption}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
