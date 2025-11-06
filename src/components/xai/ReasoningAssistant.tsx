import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Brain, ExternalLink } from 'lucide-react';
import { ApplyAIBadge } from './ApplyAIBadge';

export function ReasoningAssistant() {
  const [problem, setProblem] = useState('');
  const [reasoning, setReasoning] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!problem.trim()) {
      toast({
        title: 'Problem Required',
        description: 'Please describe a problem to analyze',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
        body: {
          action: 'reasoning',
          content: problem,
          model: 'grok-4',
          searchMode: 'on',
          returnCitations: true,
        },
      });

      if (error) throw error;

      setReasoning(data);
      toast({
        title: 'Analysis Complete!',
        description: 'Deep reasoning generated successfully',
      });
    } catch (error: any) {
      console.error('Reasoning error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to process reasoning',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Reasoning Assistant</h2>
          <p className="text-sm text-muted-foreground">Powered by Grok 4 with real-time search</p>
        </div>
        <ApplyAIBadge variant="compact" />
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="problem">Problem or Question</Label>
          <Textarea
            id="problem"
            placeholder="Describe a complex problem that requires step-by-step reasoning..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={6}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={processing || !problem.trim()}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Analyze with Deep Reasoning
            </>
          )}
        </Button>
      </Card>

      {reasoning && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reasoning Chain</h3>
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{reasoning.reasoning}</div>
            </div>

            {reasoning.citations && reasoning.citations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Sources</h4>
                <div className="space-y-1">
                  {reasoning.citations.map((citation: any, idx: number) => (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {citation.title || citation.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <span>Model: {reasoning.model}</span>
              {reasoning.usage && (
                <span>Tokens: {reasoning.usage.total_tokens}</span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
