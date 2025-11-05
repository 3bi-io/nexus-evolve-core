import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Send, ThumbsUp, ThumbsDown, TrendingUp, Globe } from "lucide-react";
import { TTSButton } from "@/components/voice/TTSButton";
import { streamChat } from "@/lib/chat";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SessionSidebar } from "./SessionSidebar";
import { UpgradePrompt } from "./pricing/UpgradePrompt";
import { Link } from "react-router-dom";
import { useClientIP } from "@/hooks/useClientIP";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ResponsiveChatLayout } from "./chat/ResponsiveChatLayout";
import { ChatHeader } from "./chat/ChatHeader";
import { useMobile } from "@/hooks/useMobile";
import { useWebSearch } from "@/hooks/useWebSearch";
import { WebSearchResults } from "./chat/WebSearchResults";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  interactionId?: string;
  rating?: number;
};

export const ChatInterface = () => {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const { ipAddress } = useClientIP();
  const { criticalIssues } = useSecretValidation();
  const { searchWeb, isSearching, searchResults, clearResults } = useWebSearch();
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (user) {
      createNewSession();
    } else {
      // Anonymous users: create a pseudo-session ID from localStorage
      const anonSessionId = localStorage.getItem('anon_session_id') || crypto.randomUUID();
      localStorage.setItem('anon_session_id', anonSessionId);
      setSessionId(anonSessionId);
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

    // Web search if enabled
    if (webSearchEnabled) {
      toast({
        title: "Searching the web...",
        description: "Gathering real-time information",
      });
      
      const searchData = await searchWeb(input);
      setWebSearchEnabled(false); // Reset after use
      
      if (!searchData) {
        toast({
          title: "Search failed",
          description: "Proceeding without web results",
          variant: "destructive",
        });
      }
    }

    // Check credits before sending
    try {
      const { data: creditCheck } = await supabase.functions.invoke('check-and-deduct-credits', {
        body: {
          operation: 'chat_message',
          userId: user?.id,
          ipAddress: !user ? ipAddress : undefined
        }
      });

      if (!creditCheck?.allowed) {
        setCurrentCredits(creditCheck?.remaining || 0);
        setSuggestedTier(creditCheck?.suggestedTier);
        setUpgradePromptOpen(true);
        return;
      }

      setCurrentCredits(creditCheck?.remainingCredits || 0);
    } catch (error) {
      console.error('Credit check failed:', error);
      toast({
        title: "Error checking credits",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { 
      role: "user", 
      content: webSearchEnabled ? `[SEARCH] ${input}` : input 
    };
    const isFirstMessage = messages.length === 0;
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (isFirstMessage && user) {
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

  const sidebar = user && !isMobile ? (
    <SessionSidebar
      currentSessionId={sessionId}
      onSessionSelect={loadSession}
      onNewSession={createNewSession}
    />
  ) : null;

  return (
    <ResponsiveChatLayout sidebar={sidebar}>
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-3 sm:p-4 md:p-6">
        {user && criticalIssues > 0 && (
          <Alert variant="destructive" className="mb-3 sm:mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-sm">Critical API keys need configuration</span>
              <Link to="/system-health">
                <Button variant="outline" size="sm" className="h-9">Fix Now</Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
        
        <ChatHeader
          contextCount={contextCount}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          messagesLength={messages.length}
          isExtracting={isExtracting}
          onExtractLearnings={extractLearnings}
          currentSessionId={sessionId}
          onSessionSelect={loadSession}
          onNewSession={createNewSession}
        />

        <ScrollArea ref={scrollRef} className="flex-1 my-3 sm:my-4 px-1">
          {searchResults && (
            <WebSearchResults 
              results={searchResults} 
              onClose={clearResults}
            />
          )}
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6 sm:py-8">
              <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Welcome to Oneiros</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                {user 
                  ? "Your AI learns from every interaction. Start with 500 credits (41+ hours) and watch your AI evolve."
                  : "Experience AI that learns from you. Sign up for 500 free credits—that's 41+ hours of intelligent conversation!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 pb-2">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[80%] md:max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "assistant" && message.interactionId && (
                      <div className="flex items-center gap-1">
                        <TTSButton 
                          text={message.content} 
                          variant="ghost" 
                          size="icon"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rateResponse(message.interactionId!, 1)}
                          className={`h-9 w-9 ${message.rating === 1 ? "text-green-600" : ""}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rateResponse(message.interactionId!, -1)}
                          className={`h-9 w-9 ${message.rating === -1 ? "text-red-600" : ""}`}
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

        <div className="flex gap-2 pt-2 pb-safe">
          <div className="flex-1 flex gap-2">
            <Button
              variant={webSearchEnabled ? "default" : "outline"}
              size="icon"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              disabled={isLoading || isSearching}
              className={cn(
                "flex-shrink-0",
                webSearchEnabled && "shadow-lg shadow-primary/20"
              )}
              title="Enable web search for real-time information"
            >
              <Globe className="w-5 h-5" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={webSearchEnabled ? "Search the web..." : (isMobile ? "Message..." : "Type your message...")}
              className="min-h-[56px] sm:min-h-[60px] resize-none text-sm sm:text-base leading-relaxed"
              disabled={isLoading || !sessionId || isSearching}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !sessionId || isSearching}
            className="h-auto px-3 sm:px-4 self-end"
          >
            <Send className="w-5 h-5" />
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
    </ResponsiveChatLayout>
  );
};
