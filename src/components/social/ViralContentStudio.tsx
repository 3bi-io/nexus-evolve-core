import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Share2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ViralContentStudio() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
        body: {
          action: 'generate',
          topic: topic.trim(),
          context: { style: style.trim() || 'engaging and informative' }
        }
      });

      if (error) throw error;

      setVariations(data.variations || []);
      toast.success('Generated viral content variations');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Viral Content Studio</h2>
        <Badge variant="outline" className="ml-2">
          Powered by Grok
        </Badge>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Topic</label>
          <Input
            placeholder="e.g., AI advancements, sustainability, tech trends..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateContent()}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Style (optional)</label>
          <Input
            placeholder="e.g., humorous, professional, inspirational..."
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>

        <Button
          onClick={generateContent}
          disabled={loading || !topic.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Viral Content
            </>
          )}
        </Button>
      </div>

      {variations.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Generated Variations
          </h3>
          {variations.map((variation, index) => (
            <Card key={index} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">
                    Variation {index + 1}
                  </Badge>
                  <Textarea
                    value={variation}
                    readOnly
                    className="min-h-[100px] bg-background resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(variation, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {variations.length === 0 && !loading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">
            Enter a topic to generate viral content variations
          </p>
        </div>
      )}
    </Card>
  );
}
