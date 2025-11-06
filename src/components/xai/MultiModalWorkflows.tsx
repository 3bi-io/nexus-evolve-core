import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Workflow, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { ApplyAIBadge } from './ApplyAIBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: any[];
  inputType: 'text' | 'image' | 'code';
  inputLabel: string;
  inputPlaceholder: string;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'image-reimagine',
    name: 'Image Reimagine',
    description: 'Analyze an image, then generate a similar but enhanced version',
    inputType: 'image',
    inputLabel: 'Image URL',
    inputPlaceholder: 'https://example.com/image.jpg',
    steps: [
      { type: 'vision', config: { query: 'Describe this image in vivid detail, focusing on style, composition, colors, and mood.' } },
      { type: 'image-gen', config: { numImages: 1 } },
    ],
  },
  {
    id: 'research-visualize',
    name: 'Research & Visualize',
    description: 'Research a topic, synthesize findings, then create a visualization',
    inputType: 'text',
    inputLabel: 'Research Topic',
    inputPlaceholder: 'The future of renewable energy',
    steps: [
      { type: 'search', config: { model: 'grok-3' } },
      { type: 'reasoning', config: { context: { instructions: 'Synthesize the research into key insights and suggest a visual representation' } } },
      { type: 'image-gen', config: { numImages: 1 } },
    ],
  },
  {
    id: 'code-document-diagram',
    name: 'Code → Docs → Diagram',
    description: 'Analyze code, generate documentation, then create an architecture diagram',
    inputType: 'code',
    inputLabel: 'Code',
    inputPlaceholder: 'Paste your code here...',
    steps: [
      { type: 'code-analysis', config: { analysisType: 'docs' } },
      { type: 'reasoning', config: { context: { instructions: 'Create a detailed prompt for an architecture diagram based on this code documentation' } } },
      { type: 'image-gen', config: { numImages: 1 } },
    ],
  },
  {
    id: 'image-extract-translate',
    name: 'Image Text Translation',
    description: 'Extract text from image, translate it, and explain context',
    inputType: 'image',
    inputLabel: 'Image URL',
    inputPlaceholder: 'https://example.com/document.jpg',
    steps: [
      { type: 'vision', config: { query: 'Extract all visible text from this image' } },
      { type: 'reasoning', config: { context: { instructions: 'Translate the extracted text to English and provide cultural context' } } },
    ],
  },
  {
    id: 'problem-solve-validate',
    name: 'Problem Solver Pro',
    description: 'Research problem, generate solution, validate with deep reasoning',
    inputType: 'text',
    inputLabel: 'Problem Statement',
    inputPlaceholder: 'How can we reduce plastic waste in oceans?',
    steps: [
      { type: 'search', config: { model: 'grok-3' } },
      { type: 'reasoning', config: { model: 'grok-4', context: { instructions: 'Propose 3 innovative solutions with pros/cons' } } },
      { type: 'reasoning', config: { model: 'grok-4', context: { instructions: 'Critically evaluate each solution for feasibility and impact' } } },
    ],
  },
];

export function MultiModalWorkflows() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(workflowTemplates[0]);
  const [input, setInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExecute = async () => {
    if (!input.trim()) {
      toast({
        title: 'Input Required',
        description: `Please provide ${selectedTemplate.inputLabel.toLowerCase()}`,
        variant: 'destructive',
      });
      return;
    }

    setExecuting(true);
    setResults(null);
    setProgress(0);

    try {
      // Prepare initial input based on template
      let initialInput: any;
      if (selectedTemplate.inputType === 'image') {
        initialInput = { imageUrl: input };
      } else if (selectedTemplate.inputType === 'code') {
        initialInput = { code: input };
      } else {
        initialInput = input;
      }

      // Simulate progress during execution
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('xai-workflow-executor', {
        body: {
          workflowId: selectedTemplate.id,
          steps: selectedTemplate.steps,
          initialInput,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResults(data);
      toast({
        title: 'Workflow Complete!',
        description: `Completed ${data.stepsCompleted}/${data.stepsTotal} steps in ${(data.totalExecutionTime / 1000).toFixed(1)}s`,
      });
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      toast({
        title: 'Workflow Failed',
        description: error.message || 'Failed to execute workflow',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Modal AI Workflows</h2>
          <p className="text-sm text-muted-foreground">Chain together vision, generation, reasoning, and analysis</p>
        </div>
        <ApplyAIBadge variant="compact" />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-4">
            <Label>Select Workflow Template</Label>
            <Select
              value={selectedTemplate.id}
              onValueChange={(id) => {
                const template = workflowTemplates.find(t => t.id === id);
                if (template) {
                  setSelectedTemplate(template);
                  setInput('');
                  setResults(null);
                }
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workflowTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{selectedTemplate.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedTemplate.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Workflow className="w-3 h-3" />
                  {selectedTemplate.steps.length} Steps
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {selectedTemplate.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="secondary">{step.type}</Badge>
                    {idx < selectedTemplate.steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input">{selectedTemplate.inputLabel}</Label>
              {selectedTemplate.inputType === 'code' ? (
                <Textarea
                  id="input"
                  placeholder={selectedTemplate.inputPlaceholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  id="input"
                  placeholder={selectedTemplate.inputPlaceholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              )}
            </div>

            <Button
              onClick={handleExecute}
              disabled={executing || !input.trim()}
              className="w-full"
              size="lg"
            >
              {executing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Executing Workflow...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Execute Workflow
                </>
              )}
            </Button>

            {executing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">Processing step {Math.ceil(progress / (100 / selectedTemplate.steps.length))} of {selectedTemplate.steps.length}...</p>
              </div>
            )}
          </Card>

          {results && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Workflow Results</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{(results.totalExecutionTime / 1000).toFixed(1)}s</span>
                    <span>•</span>
                    <span>{results.stepsCompleted}/{results.stepsTotal} steps</span>
                  </div>
                </div>

                {results.results.map((step: any, idx: number) => (
                  <div key={idx} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {step.success ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">Step {step.step}: {step.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{step.executionTime}ms</span>
                    </div>

                    {step.success && step.result && (
                      <div className="space-y-2">
                        {step.result.images && (
                          <div className="grid grid-cols-2 gap-2">
                            {step.result.images.map((url: string, imgIdx: number) => (
                              <img
                                key={imgIdx}
                                src={url}
                                alt={`Generated ${imgIdx + 1}`}
                                className="rounded-lg border"
                              />
                            ))}
                          </div>
                        )}
                        {step.result.output && typeof step.result.output === 'string' && (
                          <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                            {step.result.output}
                          </div>
                        )}
                      </div>
                    )}

                    {!step.success && step.error && (
                      <div className="text-sm text-destructive">
                        Error: {step.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom">
          <Card className="p-6">
            <p className="text-muted-foreground">
              Custom workflow builder coming soon. This will allow you to create your own multi-step workflows by chaining together any combination of vision analysis, image generation, reasoning, code analysis, and search operations.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
