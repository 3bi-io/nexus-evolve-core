import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ScanProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  currentCategory?: string;
  categoriesComplete: number;
  totalCategories: number;
  improvementsFound: number;
  startTime?: number;
}

export function PlatformAnalysisRunner() {
  const [selectedCategories, setSelectedCategories] = useState({
    performance: true,
    security: true,
    accessibility: true,
    code_quality: true,
    ux: true
  });
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    status: 'idle',
    categoriesComplete: 0,
    totalCategories: 5,
    improvementsFound: 0
  });

  const categories = [
    { id: 'performance', name: 'Performance Optimization', icon: '⚡' },
    { id: 'security', name: 'Security Vulnerabilities', icon: '🛡️' },
    { id: 'accessibility', name: 'Accessibility Issues', icon: '♿' },
    { id: 'code_quality', name: 'Code Quality', icon: '✨' },
    { id: 'ux', name: 'UX Enhancements', icon: '🎨' }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId as keyof typeof prev]
    }));
  };

  const runCompleteScan = async () => {
    const selectedCount = Object.values(selectedCategories).filter(Boolean).length;
    
    if (selectedCount === 0) {
      toast.error('Please select at least one category to analyze');
      return;
    }

    setScanProgress({
      status: 'running',
      categoriesComplete: 0,
      totalCategories: selectedCount,
      improvementsFound: 0,
      startTime: Date.now()
    });

    toast.info(`Starting comprehensive scan across ${selectedCount} categories...`);

    try {
      const { data, error } = await supabase.functions.invoke('ai-platform-optimizer', {
        body: { 
          runType: 'manual',
          categories: selectedCategories
        }
      });

      if (error) throw error;

      setScanProgress({
        status: 'completed',
        categoriesComplete: selectedCount,
        totalCategories: selectedCount,
        improvementsFound: data.improvementsFound || 0,
        startTime: scanProgress.startTime
      });

      toast.success(
        `Scan complete! Found ${data.improvementsFound} improvements across ${data.providersUsed?.length || 0} AI providers`,
        { duration: 5000 }
      );

    } catch (error: any) {
      setScanProgress(prev => ({
        ...prev,
        status: 'error'
      }));
      toast.error(error.message || 'Scan failed');
    }
  };

  const progressPercent = scanProgress.status === 'running' 
    ? (scanProgress.categoriesComplete / scanProgress.totalCategories) * 100
    : scanProgress.status === 'completed' ? 100 : 0;

  const elapsedTime = scanProgress.startTime 
    ? Math.floor((Date.now() - scanProgress.startTime) / 1000)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Run Complete Platform Scan
        </CardTitle>
        <CardDescription>
          Select categories to analyze with AI-powered code review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Analysis Categories</Label>
          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories[category.id as keyof typeof selectedCategories]}
                  onCheckedChange={() => toggleCategory(category.id)}
                  disabled={scanProgress.status === 'running'}
                />
                <Label 
                  htmlFor={category.id} 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Scan Progress */}
        {scanProgress.status !== 'idle' && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {scanProgress.status === 'running' && 'Scanning...'}
                {scanProgress.status === 'completed' && 'Scan Complete'}
                {scanProgress.status === 'error' && 'Scan Failed'}
              </span>
              <span className="text-muted-foreground">
                {scanProgress.categoriesComplete}/{scanProgress.totalCategories} categories
              </span>
            </div>
            
            <Progress value={progressPercent} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {elapsedTime}s elapsed
              </div>
              <div className="flex items-center gap-1">
                {scanProgress.status === 'completed' && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
                {scanProgress.status === 'error' && (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                {scanProgress.improvementsFound} improvements found
              </div>
            </div>
          </div>
        )}

        {/* AI Providers Info */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">AI Powered</Badge>
            <div className="text-sm text-muted-foreground">
              This scan uses multiple AI providers (Claude, GPT-5, Gemini) to analyze your codebase
              for performance, security, accessibility, code quality, and UX improvements.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={runCompleteScan} 
          disabled={scanProgress.status === 'running'}
          size="lg"
          className="w-full gap-2"
        >
          {scanProgress.status === 'running' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Platform...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Complete Scan
            </>
          )}
        </Button>

        {scanProgress.status === 'completed' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              View results in the <strong>Improvements</strong> tab
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
