import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TTSButtonProps {
  text: string;
  voiceId?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TTSButton({ text, voiceId = "9BWtsMINqrJLrRacOk9x", variant = "ghost", size = "icon" }: TTSButtonProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text, voice: voiceId },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const audioData = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Playback error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error: any) {
      console.error('TTS error:', error);
      toast({
        title: "Speech generation failed",
        description: error.message || "Failed to generate speech",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSpeak}
      disabled={isLoading || !text}
      aria-label={isPlaying ? "Stop speaking" : "Speak text"}
    >
      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </Button>
  );
}
