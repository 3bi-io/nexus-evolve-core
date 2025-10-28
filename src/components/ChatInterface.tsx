import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, LogOut } from "lucide-react";
import { streamChat } from "@/lib/chat";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SessionSidebar } from "./SessionSidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const ChatInterface = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (user) {
      createNewSession();
    }
  }, [user]);

  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      setMessages([]);
    } catch (error: any) {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadSession = async (id: string) => {
    try {
      const { data: interactions, error } = await supabase
        .from("interactions")
        .select("message, response")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = [];
      interactions?.forEach((interaction) => {
        loadedMessages.push({ role: "user", content: interaction.message });
        if (interaction.response) {
          loadedMessages.push({ role: "assistant", content: interaction.response });
        }
      });

      setMessages(loadedMessages);
      setSessionId(id);
    } catch (error: any) {
      toast({
        title: "Failed to load session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSessionTitle = async (firstMessage: string) => {
    if (!sessionId) return;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    await supabase
      .from("sessions")
      .update({ title, last_message_at: new Date().toISOString() })
      .eq("id", sessionId);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage: Message = { role: "user", content: input };
    const isFirstMessage = messages.length === 0;
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (isFirstMessage) {
      await updateSessionTitle(input);
    }

    let assistantContent = "";

    try {
      await streamChat({
        messages: [...messages, userMessage],
        sessionId,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantContent } : m
              );
            }
            return [...prev, { role: "assistant", content: assistantContent }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen">
      <SessionSidebar
        currentSessionId={sessionId}
        onSessionSelect={loadSession}
        onNewSession={createNewSession}
      />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Powered by Lovable AI</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 my-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
              <p className="text-muted-foreground max-w-md">
                Ask me anything and I'll provide thoughtful responses while learning from our interaction.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isLoading || !sessionId}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !sessionId}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
