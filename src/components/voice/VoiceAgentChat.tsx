import { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Loader2, Phone, PhoneOff, AlertCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { AudioTestButton } from "./AudioTestButton";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceAgentChatProps {
  agentId: string;
}

export function VoiceAgentChat({ agentId }: VoiceAgentChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [dbConversationId, setDbConversationId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use persistent audio permissions
  const {
    micPermission,
    requestMicPermission,
    checkSpeakerPermission,
  } = useAudioPermissions();

  // Check permissions on mount
  useEffect(() => {
    checkSpeakerPermission();
  }, [checkSpeakerPermission]);

  // Client tools that the agent can invoke
  const clientTools = {
    generateImage: async (parameters: { prompt: string; style?: string }) => {
      console.log("Agent requested image generation:", parameters);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: parameters,
        });

        if (error) throw error;

        toast({
          title: "Image generated",
          description: "The agent has generated an image for you",
        });

        return `Image generated successfully with prompt: ${parameters.prompt}`;
      } catch (error: any) {
        console.error("Image generation error:", error);
        return `Failed to generate image: ${error.message}`;
      }
    },

    getTrends: async (parameters: { topic: string; type?: string }) => {
      console.log("Agent requested trends:", parameters);
      
      try {
        const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
          body: {
            action: 'trends',
            topic: parameters.topic,
            timeRange: '24h',
          },
        });

        if (error) throw error;

        toast({
          title: "Trends fetched",
          description: `Retrieved trends for ${parameters.topic}`,
        });

        return `Trends for ${parameters.topic}: ${JSON.stringify(data.trends).substring(0, 200)}...`;
      } catch (error: any) {
        console.error("Trends error:", error);
        return `Failed to get trends: ${error.message}`;
      }
    },

    triggerIntegration: async (parameters: { integrationName: string; data: any }) => {
      console.log("Agent requested integration trigger:", parameters);
      
      toast({
        title: "Integration triggered",
        description: `Triggered ${parameters.integrationName}`,
      });

      return `Integration ${parameters.integrationName} triggered successfully`;
    },
  };

  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      console.log("Voice agent connected");
      setConnectionError(null);
      toast({
        title: "Connected",
        description: "Voice agent is ready",
      });
    },
    onDisconnect: async () => {
      console.log("Voice agent disconnected");
      
      // Update conversation end time
      if (dbConversationId) {
        const startTime = messages[0]?.timestamp;
        const endTime = new Date();
        const duration = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

        await supabase
          .from('voice_agent_conversations')
          .update({
            ended_at: endTime.toISOString(),
            duration_seconds: duration,
          })
          .eq('id', dbConversationId);
      }

      toast({
        title: "Disconnected",
        description: "Voice conversation ended",
      });
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      
      const newMessage: Message = {
        role: message.source === "user" ? "user" : "assistant",
        content: message.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // Save to database asynchronously
      if (dbConversationId) {
        (async () => {
          try {
            await supabase.from('voice_agent_messages').insert({
              conversation_id: dbConversationId,
              role: newMessage.role,
              content: newMessage.content,
            } as any);
            console.log("Message saved to database");
          } catch (error) {
            console.error("Failed to save message:", error);
          }
        })();
      }
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      const errorMessage = typeof error === 'string' ? error : 'An error occurred with the voice agent';
      setConnectionError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const startConversation = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log('Requesting microphone access...');
      
      // Request microphone permission if not granted
      if (micPermission !== 'granted') {
        const granted = await requestMicPermission();
        if (!granted) {
          throw new Error('Microphone access denied. Please enable microphone permissions in your browser settings.');
        }
      }

      console.log('Getting signed URL...');
      // Get signed URL from backend
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-signed-url', {
        body: { agentId },
      });

      if (error) {
        console.error('Error getting signed URL:', error);
        throw new Error('Failed to get conversation URL. Please check your ElevenLabs API key configuration.');
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL received from server');
      }

      console.log('Starting conversation with signed URL...');
      // Start conversation
      const convId = await conversation.startSession({ 
        signedUrl: data.signedUrl 
      });

      setConversationId(convId);

      const { data: dbConv, error: dbError } = await supabase
        .from('voice_agent_conversations')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          agent_id: agentId,
          conversation_id: convId,
        } as any)
        .select()
        .single();

      if (dbConv && !dbError) {
        setDbConversationId(dbConv.id);
      }

    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation. Please try again.';
      setConnectionError(errorMessage);
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
    setConversationId(null);
    setMessages([]);
    setConnectionError(null);
  };

  return (
    <div className="space-y-4">
      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Voice Conversation
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isConnecting && (
                    <Badge variant="secondary">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Connecting...
                    </Badge>
                  )}
                  {conversation.status === "connected" && (
                    <>
                      <Badge variant={conversation.isSpeaking ? "default" : "secondary"}>
                        {conversation.isSpeaking ? "Agent Speaking" : "Listening"}
                      </Badge>
                      {conversation.isSpeaking && (
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-primary animate-pulse" />
                          <div className="w-1 h-6 bg-primary animate-pulse delay-75" />
                          <div className="w-1 h-4 bg-primary animate-pulse delay-150" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Start a conversation to see messages
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <MarkdownRenderer content={msg.content} className="text-sm" />
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                {conversation.status === "disconnected" ? (
                  <Button
                    onClick={startConversation}
                    disabled={isConnecting}
                    className="flex-1"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Start Conversation
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={endConversation}
                    variant="destructive"
                    className="flex-1"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Conversation
                  </Button>
                )}
              </div>
              
              {/* Audio Test Button */}
              {!conversationId && (
                <div className="pt-2">
                  <AudioTestButton />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversation Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={conversation.status === "connected" ? "default" : "secondary"}>
                  {conversation.status}
                </Badge>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-medium">{messages.length}</span>
              </div>

              {conversationId && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  ID: {conversationId.substring(0, 8)}...
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-semibold">Available Tools</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Generate Image</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Get Trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Trigger Integration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}