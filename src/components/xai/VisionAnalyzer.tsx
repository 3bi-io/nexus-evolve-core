import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Upload } from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ApplyAIBadge } from './ApplyAIBadge';

export function VisionAnalyzer() {
  const [imageUrl, setImageUrl] = useState('');
  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!imageUrl.trim() || !query.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please provide both an image URL and a query',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('xai-vision-analyzer', {
        body: {
          imageUrl,
          query,
        },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: 'Analysis Complete!',
        description: data.cached ? 'Retrieved from cache' : 'Fresh analysis generated',
      });
    } catch (error: any) {
      console.error('Vision analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Vision Analyzer</h2>
          <p className="text-sm text-muted-foreground">Powered by Grok Vision Beta</p>
        </div>
        <ApplyAIBadge variant="compact" />
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {imageUrl && (
          <div className="rounded-lg border overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-64 object-contain bg-muted"
              onError={() => toast({ title: 'Invalid image URL', variant: 'destructive' })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="query">What would you like to know about this image?</Label>
          <Textarea
            id="query"
            placeholder="Describe what you see in detail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !imageUrl.trim() || !query.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Analyze Image
            </>
          )}
        </Button>
      </Card>

      {analysis && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              {analysis.cached && (
                <span className="text-xs text-muted-foreground">(Cached)</span>
              )}
            </div>
            <MarkdownRenderer content={analysis.analysis} />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Model: {analysis.model}</span>
              <span>Confidence: {(analysis.confidence_score * 100).toFixed(0)}%</span>
              <span>Time: {analysis.processing_time_ms}ms</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
