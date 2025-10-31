import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Link2, Brain, Box, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Integrations = () => {
  // LangChain State
  const [langchainTask, setLangchainTask] = useState<string>("summarize");
  const [langchainInput, setLangchainInput] = useState("");
  const [langchainContext, setLangchainContext] = useState("");
  const [langchainLanguage, setLangchainLanguage] = useState("English");
  const [langchainResult, setLangchainResult] = useState("");
  const [langchainLoading, setLangchainLoading] = useState(false);

  // Replicate State
  const [replicateModel, setReplicateModel] = useState("");
  const [replicatePrompt, setReplicatePrompt] = useState("");
  const [replicateResult, setReplicateResult] = useState<any>(null);
  const [replicateLoading, setReplicateLoading] = useState(false);

  // Mem0 State
  const [mem0Action, setMem0Action] = useState<string>("add");
  const [mem0Input, setMem0Input] = useState("");
  const [mem0Query, setMem0Query] = useState("");
  const [mem0Result, setMem0Result] = useState<any>(null);
  const [mem0Loading, setMem0Loading] = useState(false);

  const handleLangChainExecute = async () => {
    if (!langchainInput.trim()) {
      toast.error("Please enter input text");
      return;
    }

    setLangchainLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("langchain-orchestrator", {
        body: {
          task: langchainTask,
          input: langchainInput,
          context: langchainContext || undefined,
          language: langchainTask === "translate" ? langchainLanguage : undefined,
        },
      });

      if (error) throw error;

      setLangchainResult(data.result);
      toast.success("LangChain task completed!");
    } catch (error: any) {
      console.error("LangChain error:", error);
      toast.error(error.message || "Failed to execute LangChain task");
    } finally {
      setLangchainLoading(false);
    }
  };

  const handleReplicateRun = async () => {
    if (!replicateModel.trim() || !replicatePrompt.trim()) {
      toast.error("Please enter model version and prompt");
      return;
    }

    setReplicateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("replicate-runner", {
        body: {
          model: replicateModel,
          input: { prompt: replicatePrompt },
        },
      });

      if (error) throw error;

      setReplicateResult(data);
      toast.success("Replicate model started!");
    } catch (error: any) {
      console.error("Replicate error:", error);
      toast.error(error.message || "Failed to run Replicate model");
    } finally {
      setReplicateLoading(false);
    }
  };

  const handleMem0Execute = async () => {
    setMem0Loading(true);
    try {
      let body: any = { action: mem0Action };

      if (mem0Action === "add") {
        if (!mem0Input.trim()) {
          toast.error("Please enter memory content");
          return;
        }
        body.messages = [{ role: "user", content: mem0Input }];
      } else if (mem0Action === "search") {
        if (!mem0Query.trim()) {
          toast.error("Please enter search query");
          return;
        }
        body.query = mem0Query;
      }

      const { data, error } = await supabase.functions.invoke("mem0-memory", {
        body,
      });

      if (error) throw error;

      setMem0Result(data.result);
      toast.success(`Mem0 ${mem0Action} completed!`);
    } catch (error: any) {
      console.error("Mem0 error:", error);
      toast.error(error.message || "Failed to execute Mem0 operation");
    } finally {
      setMem0Loading(false);
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Integrations - Phase 2</title>
        <meta name="description" content="LangChain, Replicate, and Mem0 integrations" />
      </Helmet>

      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Phase 2 Integrations</h1>
          <p className="text-muted-foreground">
            LangChain orchestration, Replicate ML models, and Mem0 memory management
          </p>
        </div>

        <Tabs defaultValue="langchain" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="langchain">
              <Link2 className="w-4 h-4 mr-2" />
              LangChain
            </TabsTrigger>
            <TabsTrigger value="replicate">
              <Box className="w-4 h-4 mr-2" />
              Replicate
            </TabsTrigger>
            <TabsTrigger value="mem0">
              <Database className="w-4 h-4 mr-2" />
              Mem0
            </TabsTrigger>
          </TabsList>

          <TabsContent value="langchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  LangChain Orchestrator
                </CardTitle>
                <CardDescription>
                  Execute advanced LLM chains for summarization, Q&A, translation, analysis, and extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select value={langchainTask} onValueChange={setLangchainTask}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summarize">Summarize</SelectItem>
                      <SelectItem value="qa">Q&A</SelectItem>
                      <SelectItem value="translate">Translate</SelectItem>
                      <SelectItem value="analyze">Analyze</SelectItem>
                      <SelectItem value="extract">Extract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Input</Label>
                  <Textarea
                    value={langchainInput}
                    onChange={(e) => setLangchainInput(e.target.value)}
                    placeholder="Enter text to process..."
                    rows={4}
                  />
                </div>

                {langchainTask === "qa" && (
                  <div className="space-y-2">
                    <Label>Context (optional)</Label>
                    <Textarea
                      value={langchainContext}
                      onChange={(e) => setLangchainContext(e.target.value)}
                      placeholder="Enter context for Q&A..."
                      rows={3}
                    />
                  </div>
                )}

                {langchainTask === "translate" && (
                  <div className="space-y-2">
                    <Label>Target Language</Label>
                    <Input
                      value={langchainLanguage}
                      onChange={(e) => setLangchainLanguage(e.target.value)}
                      placeholder="e.g., Spanish, French, German"
                    />
                  </div>
                )}

                <Button onClick={handleLangChainExecute} disabled={langchainLoading} className="w-full">
                  {langchainLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Execute Chain
                </Button>

                {langchainResult && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{langchainResult}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="replicate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Replicate Runner
                </CardTitle>
                <CardDescription>
                  Run ML models on Replicate's infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Model Version ID</Label>
                  <Input
                    value={replicateModel}
                    onChange={(e) => setReplicateModel(e.target.value)}
                    placeholder="e.g., stability-ai/sdxl:..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    value={replicatePrompt}
                    onChange={(e) => setReplicatePrompt(e.target.value)}
                    placeholder="Enter your prompt..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleReplicateRun} disabled={replicateLoading} className="w-full">
                  {replicateLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Run Model
                </Button>

                {replicateResult && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(replicateResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mem0" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Mem0 Memory
                </CardTitle>
                <CardDescription>
                  Advanced memory management for AI applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={mem0Action} onValueChange={setMem0Action}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Memory</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="get">Get All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {mem0Action === "add" && (
                  <div className="space-y-2">
                    <Label>Memory Content</Label>
                    <Textarea
                      value={mem0Input}
                      onChange={(e) => setMem0Input(e.target.value)}
                      placeholder="Enter memory content..."
                      rows={4}
                    />
                  </div>
                )}

                {mem0Action === "search" && (
                  <div className="space-y-2">
                    <Label>Search Query</Label>
                    <Input
                      value={mem0Query}
                      onChange={(e) => setMem0Query(e.target.value)}
                      placeholder="Search memories..."
                    />
                  </div>
                )}

                <Button onClick={handleMem0Execute} disabled={mem0Loading} className="w-full">
                  {mem0Loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Execute
                </Button>

                {mem0Result && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(mem0Result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Integrations;
