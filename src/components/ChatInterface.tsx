import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Send, LogOut, ThumbsUp, ThumbsDown, Sparkles, TrendingUp, Search } from "lucide-react";
import { streamChat } from "@/lib/chat";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SessionSidebar } from "./SessionSidebar";
import { AgentSelector } from "./AgentSelector";
import { UpgradePrompt } from "./pricing/UpgradePrompt";
import { Link } from "react-router-dom";

type Message = {
  role: "user" | "assistant";
  content: string;
  interactionId?: string;
  rating?: number;
};

export const ChatInterface = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [contextCount, setContextCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(5);
  const [suggestedTier, setSuggestedTier] = useState<string | undefined>();
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
        .select("id, message, response, quality_rating")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = [];
      interactions?.forEach((interaction) => {
        loadedMessages.push({ role: "user", content: interaction.message });
        if (interaction.response) {
          loadedMessages.push({ 
            role: "assistant", 
            content: interaction.response,
            interactionId: interaction.id,
            rating: interaction.quality_rating 
          });
        }
      });

      setMessages(loadedMessages);
      setSessionId(id);

      // Load context count for this session
      if (user) {
        const { data: memories } = await supabase
          .from("agent_memory")
          .select("id")
          .eq("user_id", user.id);
        setContextCount(memories?.length || 0);
      }
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
        forceAgent: selectedAgent === "auto" ? undefined : selectedAgent,
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

  const rateResponse = async (interactionId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from("interactions")
        .update({ quality_rating: rating })
        .eq("id", interactionId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) =>
          m.interactionId === interactionId ? { ...m, rating } : m
        )
      );

      toast({
        title: "Rating saved",
        description: "Thank you for your feedback!",
      });

      // PHASE 3B: Auto-trigger feedback analysis after every 20 rated interactions
      const { count } = await supabase
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .not("quality_rating", "is", null);

      if (count && count % 20 === 0) {
        // Trigger feedback analysis in background
        supabase.functions
          .invoke("analyze-feedback", {
            body: { timeframe: 30 },
          })
          .then(({ data, error }) => {
            if (!error && data) {
              toast({
                title: "🧠 System Learning Update",
                description: `Analyzed recent feedback and created ${data.behaviors_created} new behavioral patterns.`,
              });
            }
          });
      }
    } catch (error: any) {
      toast({
        title: "Failed to save rating",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const extractLearnings = async () => {
    if (!sessionId) return;

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-learnings", {
        body: { sessionId },
      });

      if (error) throw error;

      // PHASE 4: Enhanced toast with breakdown
      const breakdown = data.breakdown || data.summary;
      const details = [];
      if (breakdown.facts > 0) details.push(`${breakdown.facts} facts`);
      if (breakdown.topics > 0) details.push(`${breakdown.topics} topics`);
      if (breakdown.solutions > 0) details.push(`${breakdown.solutions} solutions`);
      if (breakdown.patterns > 0) details.push(`${breakdown.patterns} patterns`);

      toast({
        title: "🧠 Learning extraction complete",
        description: `Extracted ${data.summary?.total_learnings || data.learnings_stored} insights: ${details.join(", ")}`,
      });

      // Reload context count
      if (user) {
        const { data: memories } = await supabase
          .from("agent_memory")
          .select("id")
          .eq("user_id", user.id);
        setContextCount(memories?.length || 0);
      }
    } catch (error: any) {
      toast({
        title: "Failed to extract learnings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const loadRecentMemories = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("agent_memory")
        .select("id, memory_type, context_summary, importance_score, retrieval_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      setRecentMemories(data || []);
    } catch (error) {
      console.error("Failed to load memories:", error);
    }
  };

  return (
    <div className="flex" style={{ height: 'calc(100vh - 57px)' }}>
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
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Powered by Lovable AI</p>
                {contextCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      loadRecentMemories();
                      setMemoryModalOpen(true);
                    }}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    {contextCount} memories
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AgentSelector 
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
            {contextCount > 0 && (
              <Link to="/evolution">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            {messages.length >= 4 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={extractLearnings}
                disabled={isExtracting}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isExtracting ? "Extracting..." : "Extract Learnings"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
                  <div className="flex flex-col gap-2">
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "assistant" && message.interactionId && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateResponse(message.interactionId!, 1)}
                          className={message.rating === 1 ? "text-green-600" : ""}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateResponse(message.interactionId!, -1)}
                          className={message.rating === -1 ? "text-red-600" : ""}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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

      {/* PHASE 4: Memory Details Modal */}
      <Dialog open={memoryModalOpen} onOpenChange={setMemoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Active Memories
            </DialogTitle>
            <DialogDescription>
              Recent learnings and patterns the system has extracted
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {recentMemories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No memories yet</p>
            ) : (
              recentMemories.map((memory) => (
                <div key={memory.id} className="p-4 rounded-lg bg-muted">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {memory.memory_type?.replace(/_/g, " ") || "general"}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Importance: {(memory.importance_score * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span>Retrieved: {memory.retrieval_count}x</span>
                    </div>
                  </div>
                  <p className="text-sm">{memory.context_summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(memory.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Link to="/evolution">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        currentCredits={currentCredits}
        suggestedTier={suggestedTier}
      />
    </div>
  );
};
