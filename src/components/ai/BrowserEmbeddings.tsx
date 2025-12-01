import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Cpu, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { loadTransformers } from "@/lib/transformers-loader";
import { executeWithFallback, serverEmbeddings } from "@/lib/browser-ai-wrapper";

export const BrowserEmbeddings = () => {
  const [text, setText] = useState("");
  const [embeddings, setEmbeddings] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [usedServer, setUsedServer] = useState(false);

  const generateEmbeddings = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      const { result, usedServer: serverUsed } = await executeWithFallback(
        'embeddings',
        async () => {
          const transformers = await loadTransformers();
          if (!transformers) {
            throw new Error('Transformers.js unavailable');
          }

          const extractor = await transformers.pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
            { device: "webgpu" }
          );

          const output = await extractor(text, { pooling: "mean", normalize: true });
          return output.tolist();
        },
        async () => {
          const result = await serverEmbeddings([text]);
          return result;
        }
      );
      
      setEmbeddings(result);
      setUsedServer(serverUsed);
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
      
      if (serverUsed) {
        toast.info("Browser AI unavailable, using server inference");
      } else {
        toast.success("Embeddings generated in browser!");
      }
    } catch (error) {
      console.error("Embeddings error:", error);
      toast.error("Failed to generate embeddings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Browser-Based Embeddings</h3>
          </div>
          {usedServer && (
            <Badge variant="secondary" className="gap-1">
              <Server className="h-3 w-3" />
              Server Mode
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Generate text embeddings directly in your browser using WebGPU. No server required!
        </p>

        <Textarea
          placeholder="Enter text to generate embeddings..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />

        <Button 
          onClick={generateEmbeddings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Embeddings"
          )}
        </Button>

        {loadTime && (
          <div className="text-sm text-muted-foreground">
            Generated in {loadTime.toFixed(0)}ms
          </div>
        )}

        {embeddings && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Results:</p>
            <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
              <code className="text-xs">
                Dimension: {embeddings[0]?.length || 0}<br />
                First 10 values: [{embeddings[0]?.slice(0, 10).map(v => v.toFixed(4)).join(", ")}...]
              </code>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
