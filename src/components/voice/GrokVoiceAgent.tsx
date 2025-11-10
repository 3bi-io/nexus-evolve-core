import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Sparkles, Volume2, VolumeX, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWakeWord } from '@/hooks/useWakeWord';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BrowserSupport {
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasMediaDevices: boolean;
  isMobile: boolean;
  isIOS: boolean;
}

const checkBrowserSupport = (): BrowserSupport => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  return {
    hasSpeechRecognition: !!SpeechRecognition,
    hasSpeechSynthesis: 'speechSynthesis' in window,
    hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
  };
};

export const GrokVoiceAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const support = checkBrowserSupport();
    setBrowserSupport(support);

    if (!support.hasSpeechRecognition && !support.isIOS) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or use the ElevenLabs tab.",
        variant: "destructive"
      });
    }

    if (support.isIOS) {
      toast({
        title: "iOS Safari Detected",
        description: "Speech recognition is limited on iOS. We recommend using the ElevenLabs tab for best experience.",
        variant: "default"
      });
    }
  }, [toast]);

  const handleWakeWord = () => {
    toast({
      title: "Wake Word Detected!",
      description: "Eros is listening...",
    });
    speak("Eros recognizes you. How can I assist?");
    setIsActive(true);
  };

  const { isListening } = useWakeWord({
    wakeWord: '416292',
    onWakeWordDetected: handleWakeWord,
    enabled: !isActive && micPermission === 'granted'
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      toast({
        title: "Microphone Access Granted",
        description: "You can now use voice features",
      });
      return true;
    } catch (error) {
      setMicPermission('denied');
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access in your browser settings",
        variant: "destructive"
      });
      return false;
    }
  };

  const startListening = async () => {
    if (!browserSupport?.hasSpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Try Chrome or use ElevenLabs.",
        variant: "destructive"
      });
      return;
    }

    if (micPermission === 'pending') {
      const granted = await requestMicrophoneAccess();
      if (!granted) return;
    }

    if (micPermission === 'denied') {
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone access in your browser settings and reload the page",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setCurrentTranscript(transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        handleUserMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
      }
      setIsActive(false);
    };

    recognition.onend = () => {
      setCurrentTranscript('');
      if (isActive) {
        setTimeout(() => recognition.start(), 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleUserMessage = async (transcript: string) => {
    const userMessage: Message = {
      role: 'user',
      content: transcript,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use Grok",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('xai-chat', {
        body: {
          messages: [
            { role: 'system', content: 'You are Eros, a sophisticated AI assistant. Respond concisely and naturally.' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: transcript }
          ],
          model: 'grok-beta',
          temperature: 0.7,
          max_tokens: 500
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      speak(assistantMessage.content);

    } catch (error) {
      console.error('Grok API error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from Grok",
        variant: "destructive"
      });
    }
  };

  const toggleActive = () => {
    if (isActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      speechSynthesis.cancel();
      setIsActive(false);
    } else {
      setIsActive(true);
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="space-y-4">
      {browserSupport && !browserSupport.hasSpeechRecognition && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your browser doesn't support speech recognition. Please use Chrome or switch to the ElevenLabs tab for voice features.
          </AlertDescription>
        </Alert>
      )}

      {browserSupport?.isIOS && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            iOS Safari has limited speech recognition support. For the best experience, use the ElevenLabs tab or try Chrome on desktop.
          </AlertDescription>
        </Alert>
      )}

      {micPermission === 'pending' && browserSupport?.hasSpeechRecognition && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Microphone access needed for voice features</span>
            <Button size="sm" onClick={requestMicrophoneAccess}>
              Grant Access
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {micPermission === 'granted' && browserSupport?.hasSpeechRecognition && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Microphone ready - you can use voice features
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Eros Voice Interface
              {micPermission === 'granted' && (
                <Badge variant="default" className="ml-auto">Ready</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Wake Word Status</p>
                <p className="text-xs text-muted-foreground">
                  {isListening ? 'Listening for "416292"' : micPermission === 'granted' ? 'Inactive' : 'Awaiting mic access'}
                </p>
              </div>
              <div className={`h-3 w-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Agent Status</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? 'Active - Listening' : 'Standby'}
                </p>
              </div>
              {isSpeaking && <Volume2 className="h-4 w-4 text-primary animate-pulse" />}
              {!isSpeaking && <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </div>

            {currentTranscript && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Hearing:</p>
                <p className="text-sm font-medium">{currentTranscript}</p>
              </div>
            )}

            <Button 
              onClick={toggleActive}
              className="w-full"
              variant={isActive ? "destructive" : "default"}
              disabled={!browserSupport?.hasSpeechRecognition || micPermission === 'denied'}
            >
              {isActive ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Deactivate Eros
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  {micPermission === 'pending' ? 'Grant Microphone Access First' : 'Activate Eros'}
                </>
              )}
            </Button>

            {micPermission === 'denied' && (
              <p className="text-sm text-destructive text-center">
                Microphone access denied. Please enable it in browser settings.
              </p>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Say "416292" to activate wake word mode</p>
              <p>• Click "Activate Eros" for manual voice control</p>
              <p>• Powered by xAI Grok with real-time web search</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No messages yet. Activate Eros to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 text-muted-foreground">
                        {msg.role === 'user' ? 'You' : 'Eros'}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};