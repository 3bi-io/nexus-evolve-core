import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Monitor, Database, Search, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const AdvancedAI = () => {
  const { validation } = useSecretValidation();
  
  // Computer Use State
  const [computerTask, setComputerTask] = useState("");
  const [computerContext, setComputerContext] = useState("");
  const [computerResult, setComputerResult] = useState<any>(null);
  const [computerLoading, setComputerLoading] = useState(false);

  // Pinecone State
  const [pineconeAction, setPineconeAction] = useState<string>("query");
  const [pineconeText, setPineconeText] = useState("");
  const [pineconeNamespace, setPineconeNamespace] = useState("default");
  const [pineconeTopK, setPineconeTopK] = useState(10);
  const [pineconeResult, setPineconeResult] = useState<any>(null);
  const [pineconeLoading, setPineconeLoading] = useState(false);

  const handleComputerUse = async () => {
    if (!computerTask.trim()) {
      toast.error("Please enter a task");
      return;
    }

    setComputerLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("computer-use", {
        body: {
          task: computerTask,
          context: computerContext || undefined,
        },
      });

      if (error) throw error;

      setComputerResult(data);
      toast.success("Computer use task completed!");
    } catch (error: any) {
      console.error("Computer use error:", error);
      toast.error(error.message || "Failed to execute computer use task");
    } finally {
      setComputerLoading(false);
    }
  };

  const handlePineconeOperation = async () => {
    if (!pineconeText.trim() && (pineconeAction === "query" || pineconeAction === "upsert")) {
      toast.error("Please enter text for this operation");
      return;
    }

    setPineconeLoading(true);
    try {
      let body: any = {
        action: pineconeAction,
        namespace: pineconeNamespace,
      };

      if (pineconeAction === "query") {
        body.text = pineconeText;
        body.top_k = pineconeTopK;
      } else if (pineconeAction === "upsert") {
        body.text = pineconeText;
        body.vectors = [
          {
            id: `vec-${Date.now()}`,
            values: [], // Will be generated from text
            metadata: { text: pineconeText },
          },
        ];
      }

      const { data, error } = await supabase.functions.invoke("pinecone-vector", {
        body,
      });

      if (error) throw error;

      setPineconeResult(data.result);
      toast.success(`Pinecone ${pineconeAction} completed!`);
    } catch (error: any) {
      console.error("Pinecone error:", error);
      toast.error(error.message || "Failed to execute Pinecone operation");
    } finally {
      setPineconeLoading(false);
    }
  };

  return (
    <AppLayout title="Advanced AI" showBottomNav>
      <SEO
        title="Advanced AI - Computer Use & Pinecone Vector Database"
        description="Advanced AI capabilities including Anthropic Computer Use and Pinecone vector database integration. Automate complex tasks and manage high-dimensional vectors."
        keywords="computer use, Anthropic, Pinecone, vector database, AI automation"
        canonical="https://oneiros.me/advanced-ai"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Phase 3 Advanced AI</h1>
          <p className="text-muted-foreground">
            Anthropic Computer Use and Pinecone vector database integration
          </p>
        </div>

        {validation && (!validation.results.ANTHROPIC_API_KEY?.valid || !validation.results.PINECONE_API_KEY?.valid) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Configuration Required</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                {!validation.results.ANTHROPIC_API_KEY?.valid && 'Anthropic API key is not configured. '}
                {!validation.results.PINECONE_API_KEY?.valid && 'Pinecone API key or host is not configured.'}
              </span>
              <Link to="/system-health">
                <Button variant="outline" size="sm">Configure Keys</Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="computer-use" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="computer-use">
              <Monitor className="w-4 h-4 mr-2" />
              Computer Use
            </TabsTrigger>
            <TabsTrigger value="pinecone">
              <Database className="w-4 h-4 mr-2" />
              Pinecone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="computer-use" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Computer Use Agent
                </CardTitle>
                <CardDescription>
                  Use Claude's computer use capabilities for web browsing, automation, and complex tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Task</Label>
                  <Textarea
                    value={computerTask}
                    onChange={(e) => setComputerTask(e.target.value)}
                    placeholder="e.g., Search for the latest AI news and summarize the top 3 articles"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Context (optional)</Label>
                  <Textarea
                    value={computerContext}
                    onChange={(e) => setComputerContext(e.target.value)}
                    placeholder="Additional context or instructions..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleComputerUse} disabled={computerLoading} className="w-full">
                  {computerLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Execute Task
                </Button>

                {computerResult && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Result</Label>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="whitespace-pre-wrap">{computerResult.result}</p>
                      </div>
                    </div>

                    {computerResult.tool_uses && computerResult.tool_uses.length > 0 && (
                      <div className="space-y-2">
                        <Label>Tool Uses ({computerResult.tool_uses.length})</Label>
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          {computerResult.tool_uses.map((tool: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <strong>{tool.name}:</strong>{" "}
                              {JSON.stringify(tool.input).substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      Latency: {computerResult.latency_ms}ms | Tokens:{" "}
                      {computerResult.usage?.input_tokens + computerResult.usage?.output_tokens}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pinecone" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Pinecone Vector Database
                </CardTitle>
                <CardDescription>
                  Store and query high-dimensional vectors with metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Operation</Label>
                  <Select value={pineconeAction} onValueChange={setPineconeAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="query">Query</SelectItem>
                      <SelectItem value="upsert">Upsert</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Namespace</Label>
                  <Input
                    value={pineconeNamespace}
                    onChange={(e) => setPineconeNamespace(e.target.value)}
                    placeholder="default"
                  />
                </div>

                {(pineconeAction === "query" || pineconeAction === "upsert") && (
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Textarea
                      value={pineconeText}
                      onChange={(e) => setPineconeText(e.target.value)}
                      placeholder={
                        pineconeAction === "query"
                          ? "Enter query text..."
                          : "Enter text to store..."
                      }
                      rows={4}
                    />
                  </div>
                )}

                {pineconeAction === "query" && (
                  <div className="space-y-2">
                    <Label>Top K Results</Label>
                    <Input
                      type="number"
                      value={pineconeTopK}
                      onChange={(e) => setPineconeTopK(parseInt(e.target.value))}
                      min={1}
                      max={100}
                    />
                  </div>
                )}

                <Button onClick={handlePineconeOperation} disabled={pineconeLoading} className="w-full">
                  {pineconeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Execute
                </Button>

                {pineconeResult && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="p-4 bg-muted rounded-lg max-h-96 overflow-auto">
                      <pre className="text-sm">{JSON.stringify(pineconeResult, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdvancedAI;
