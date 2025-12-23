import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseWakeWordProps {
  wakeWord: string;
  onWakeWordDetected: () => void;
  enabled?: boolean;
}

export const useWakeWord = ({ wakeWord, onWakeWordDetected, enabled = true }: UseWakeWordProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      if (import.meta.env.DEV) {
        console.log('Wake word detection started');
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (import.meta.env.DEV) {
        console.log('Heard:', transcript);
      }

      // Normalize transcript (handles "four one six two nine two", "416292", etc.)
      const normalized = transcript.replace(/\s/g, '');
      const wakeWordNormalized = wakeWord.toLowerCase().replace(/\s/g, '');

      if (normalized.includes(wakeWordNormalized)) {
        if (import.meta.env.DEV) {
          console.log('Wake word detected!');
        }
        onWakeWordDetected();
      }
    };

    recognition.onerror = (event: any) => {
      if (import.meta.env.DEV) {
        console.error('Speech recognition error:', event.error);
      }
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access to use wake word detection",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      if (enabled) {
        if (import.meta.env.DEV) {
          console.log('Recognition ended, restarting...');
        }
        setTimeout(() => recognition.start(), 1000);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to start recognition:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
  }, [wakeWord, onWakeWordDetected, enabled, toast]);

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, stop };
};
