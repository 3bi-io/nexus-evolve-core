import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Code, AlertTriangle, CheckCircle } from 'lucide-react';
import { ApplyAIBadge } from './ApplyAIBadge';
import { Badge } from '@/components/ui/badge';

export function GrokCodeAnalyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysisType, setAnalysisType] = useState<'review' | 'bugs' | 'security' | 'performance' | 'docs' | 'refactor'>('review');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter code to analyze',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('xai-code-analyzer', {
        body: {
          code,
          language,
          analysisType,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: 'Analysis Complete!',
        description: `Code analyzed successfully with ${data.model}`,
      });
    } catch (error: any) {
      console.error('Code analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze code',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Code Analyzer</h2>
          <p className="text-sm text-muted-foreground">Powered by Grok Code Fast</p>
        </div>
        <ApplyAIBadge variant="compact" />
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="auto">Auto-detect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="review">Code Review</SelectItem>
                <SelectItem value="bugs">Bug Detection</SelectItem>
                <SelectItem value="security">Security Audit</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="docs">Documentation</SelectItem>
                <SelectItem value="refactor">Refactoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Textarea
            id="code"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !code.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" />
              Analyze Code
            </>
          )}
        </Button>
      </Card>

      {analysis && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              {analysis.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Code Quality Score:</span>
                  <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
                    {analysis.score}/100
                  </Badge>
                </div>
              )}
            </div>

            {analysis.summary && (
              <div className="prose prose-sm max-w-none">
                <p>{analysis.summary}</p>
              </div>
            )}

            {analysis.issues && analysis.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Issues Found</h4>
                {analysis.issues.map((issue: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg border">
                    {issue.severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityVariant(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        {issue.line && <span className="text-xs text-muted-foreground">Line {issue.line}</span>}
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      {issue.suggestion && (
                        <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.raw && (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-xs">{analysis.summary}</pre>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
