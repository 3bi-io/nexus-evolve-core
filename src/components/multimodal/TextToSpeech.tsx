import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Volume2, Loader2, Play, Pause, Download } from "lucide-react";

export function TextToSpeech() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("9BWtsMINqrJLrRacOk9x"); // Aria
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ElevenLabs voices
  const voices = [
    { value: "9BWtsMINqrJLrRacOk9x", label: "Aria" },
    { value: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger" },
    { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah" },
    { value: "FGY2WhTYpPnrIDTdsKH5", label: "Laura" },
    { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie" },
    { value: "JBFqnCBsd6RMkjVDRZzb", label: "George" },
    { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" },
    { value: "SAz9YHcvj6GT2YYXdXww", label: "River" },
    { value: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam" },
    { value: "XB0fDUnXU5powFXDhCwa", label: "Charlotte" },
    { value: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice" },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text, voice },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const audioData = `data:audio/mp3;base64,${data.audioContent}`;
      setAudioUrl(audioData);

      // Create audio element
      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.onended = () => setPlaying(false);

      toast({
        title: "Speech generated!",
        description: "Your text has been converted to speech",
      });
    } catch (error: any) {
      console.error('TTS error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate speech",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Text to Speech
        </CardTitle>
        <CardDescription>
          Convert text to natural-sounding speech
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text">Text to Convert</Label>
          <Textarea
            id="text"
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select value={voice} onValueChange={setVoice} disabled={loading}>
            <SelectTrigger id="voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>

        {audioUrl && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Generated Audio</p>
            <div className="flex gap-2">
              <Button
                onClick={togglePlay}
                variant="outline"
                className="flex-1"
              >
                {playing ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
