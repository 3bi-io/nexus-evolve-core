import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Square, Loader2, Copy } from "lucide-react";

export function VoiceRecorder() {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);

      toast({
        title: "Recording started",
        description: "Speak into your microphone",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording failed",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setTranscribing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data.error) {
          throw new Error(data.error);
        }

        setTranscription(data.text);

        toast({
          title: "Transcription complete",
          description: "Your audio has been transcribed",
        });
      };
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error.message || "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setTranscribing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    toast({
      title: "Copied to clipboard",
      description: "Transcription copied successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice to Text
        </CardTitle>
        <CardDescription>
          Record audio and convert it to text using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!recording ? (
            <Button
              onClick={startRecording}
              disabled={transcribing}
              className="flex-1"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {recording && (
          <div className="flex items-center justify-center p-4 bg-destructive/10 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 text-destructive">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="font-medium">Recording...</span>
            </div>
          </div>
        )}

        {transcribing && (
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>Transcribing audio...</span>
          </div>
        )}

        {transcription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Transcription</label>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={transcription}
              readOnly
              rows={8}
              className="font-mono"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
