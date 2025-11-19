import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Lightbulb, ListChecks, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ReasoningStep = {
  step: number;
  type: "analysis" | "breakdown" | "solution" | "verification";
  content: string;
};

import { PageLayout } from "@/components/layout/PageLayout";

import { SEO } from "@/components/SEO";

export default function ProblemSolver() {
  const [problem, setProblem] = useState("");
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalSolution, setFinalSolution] = useState("");

  const solveProblem = async () => {
    if (!problem.trim()) {
      toast({ title: "Please enter a problem", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setSteps([]);
    setFinalSolution("");

    try {
      const { data, error } = await supabase.functions.invoke("reasoning-agent", {
        body: { problem },
      });

      if (error) throw error;

      if (data?.steps) {
        setSteps(data.steps);
      }
      if (data?.solution) {
        setFinalSolution(data.solution);
      }

      toast({
        title: "Problem analyzed",
        description: "Reasoning complete",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <Brain className="w-5 h-5 text-primary" />;
      case "breakdown":
        return <ListChecks className="w-5 h-5 text-accent" />;
      case "solution":
        return <Lightbulb className="w-5 h-5 text-warning" />;
      case "verification":
        return <Target className="w-5 h-5 text-success" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  return (
    <PageLayout title="Solver" showBottomNav={true}>
      <SEO 
        title="Problem Solver - Step-by-Step AI Reasoning & Solution Analysis"
        description="Break down complex problems with advanced AI reasoning. Get detailed step-by-step analysis, breakdown, solutions, and verification for any challenge."
        keywords="problem solver, AI reasoning, step-by-step analysis, complex problem solving, reasoning agent"
        canonical="https://oneiros.me/problem-solver"
      />
      
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Problem Solver</h1>
            <p className="text-sm md:text-base text-muted-foreground">Advanced reasoning for complex challenges</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Describe Your Problem</CardTitle>
            <CardDescription>
              Provide a detailed description. The system will break it down step-by-step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: I need to design a scalable microservices architecture for an e-commerce platform that can handle 100k concurrent users..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[150px]"
            />
            <Button onClick={solveProblem} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Problem
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reasoning Process</CardTitle>
              <CardDescription>Step-by-step analysis and solution</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-4 p-4 rounded-lg bg-card border border-border"
                    >
                      <div className="flex-shrink-0 mt-1">{getStepIcon(step.type)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.step}</Badge>
                          <Badge variant="secondary">{step.type}</Badge>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {finalSolution && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Final Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{finalSolution}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
