import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Cpu } from "lucide-react";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";

export const BrowserEmbeddings = () => {
  const [text, setText] = useState("");
  const [embeddings, setEmbeddings] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const generateEmbeddings = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      // Create feature-extraction pipeline on WebGPU
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        { device: "webgpu" }
      );

      // Compute embeddings
      const result = await extractor(text, { pooling: "mean", normalize: true });
      const embeddingArray = result.tolist();
      
      setEmbeddings(embeddingArray);
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
      
      toast.success("Embeddings generated in browser!");
    } catch (error) {
      console.error("Embeddings error:", error);
      toast.error("Failed to generate embeddings. Make sure WebGPU is supported.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Browser-Based Embeddings</h3>
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
