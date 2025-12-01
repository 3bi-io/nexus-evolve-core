import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mic, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";
import { isBrowserAISupported } from "@/lib/csp-detector";

export const BrowserSpeechRecognition = () => {
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const cspSupported = isBrowserAISupported();

  const transcribeAudio = async () => {
    if (!cspSupported) {
      toast.error("Browser AI blocked by Content Security Policy");
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      // Create automatic speech recognition pipeline
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        { device: "webgpu" }
      );

      // Use sample audio (in production, you'd capture from microphone)
      const url = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";
      const output = await transcriber(url);
      
      const text = Array.isArray(output) ? output[0]?.text : output.text;
      setTranscription(text || "");
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
      
      toast.success("Audio transcribed in browser!");
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio. Make sure WebGPU is supported.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Browser Speech Recognition</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Transcribe audio directly in your browser using Whisper. No server required!
        </p>

        {!cspSupported && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Browser AI is blocked by Content Security Policy. Speech recognition requires WebGPU and JavaScript eval support.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={transcribeAudio} 
          disabled={loading || !cspSupported}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transcribing...
            </>
          ) : (
            "Transcribe Sample Audio"
          )}
        </Button>

        {loadTime && (
          <div className="text-sm text-muted-foreground">
            Transcribed in {(loadTime / 1000).toFixed(1)}s
          </div>
        )}

        {transcription && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Transcription:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{transcription}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
