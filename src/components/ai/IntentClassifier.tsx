import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Server } from "lucide-react";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";
import { executeWithFallback, serverClassification } from "@/lib/browser-ai-wrapper";

export const IntentClassifier = () => {
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<{ label: string; score: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [usedServer, setUsedServer] = useState(false);

  const classifyIntent = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      const candidateLabels = [
        "generate image",
        "translate text",
        "summarize content",
        "answer question",
        "write code",
        "analyze data"
      ];

      const { result, usedServer: serverUsed } = await executeWithFallback(
        'classification',
        async () => {
          const classifier = await pipeline(
            "zero-shot-classification",
            "Xenova/distilbert-base-uncased-mnli",
            { device: "webgpu" }
          );

          const output = await classifier(query, candidateLabels);
          const resultData = Array.isArray(output) ? output[0] : output;
          return resultData.labels.map((label: string, i: number) => ({
            label,
            score: resultData.scores[i]
          }));
        },
        async () => {
          const result = await serverClassification(query, candidateLabels);
          return result.labels.map((label: string, i: number) => ({
            label,
            score: result.scores[i]
          }));
        }
      );

      setIntent(result);
      setUsedServer(serverUsed);
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
      
      if (serverUsed) {
        toast.info("Browser AI unavailable, using server inference");
      } else {
        toast.success("Intent classified in browser!");
      }
    } catch (error) {
      console.error("Classification error:", error);
      toast.error("Failed to classify intent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Local Intent Classification</h3>
          </div>
          {usedServer && (
            <Badge variant="secondary" className="gap-1">
              <Server className="h-3 w-3" />
              Server Mode
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Classify user intent directly in the browser using zero-shot classification.
        </p>

        <Input
          placeholder="What would you like to do?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && classifyIntent()}
        />

        <Button 
          onClick={classifyIntent} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Classifying...
            </>
          ) : (
            "Classify Intent"
          )}
        </Button>

        {loadTime && (
          <div className="text-sm text-muted-foreground">
            Classified in {loadTime.toFixed(0)}ms
          </div>
        )}

        {intent && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Detected Intents:</p>
            <div className="space-y-2">
              {intent.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium capitalize">{item.label}</span>
                  <Badge variant={idx === 0 ? "default" : "secondary"}>
                    {(item.score * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
