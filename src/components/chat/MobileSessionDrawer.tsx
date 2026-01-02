import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesSquare, Plus, MessageCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useHaptics } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  last_message_at: string | null;
}

interface MobileSessionDrawerProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const MobileSessionDrawer = ({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession 
}: MobileSessionDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const { light, medium } = useHaptics();

  useEffect(() => {
    if (open) {
      loadSessions();
    }
  }, [open]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, message_count, created_at, last_message_at")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    light();
    onSessionSelect(sessionId);
    setOpen(false);
  };

  const handleNewSession = () => {
    medium();
    onNewSession();
    setOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getSessionTitle = (session: Session) => {
    if (session.title) {
      return session.title.length > 28 
        ? session.title.substring(0, 28) + "..." 
        : session.title;
    }
    return "New conversation";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 touch-manipulation"
          aria-label="View chat history"
        >
          <MessagesSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 safe-left">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Chat History
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-3 border-b">
          <Button 
            onClick={handleNewSession} 
            className="w-full gap-2 h-12 touch-manipulation"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="h-[calc(100dvh-160px)]">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all duration-200",
                    "touch-manipulation active:scale-[0.98]",
                    "hover:bg-accent/50",
                    currentSessionId === session.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-transparent border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      currentSessionId === session.id 
                        ? "bg-primary/20" 
                        : "bg-muted/50"
                    )}>
                      <MessageCircle className={cn(
                        "w-4 h-4",
                        currentSessionId === session.id 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        currentSessionId === session.id && "text-primary"
                      )}>
                        {getSessionTitle(session)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(session.last_message_at || session.created_at)}
                        </span>
                        {session.message_count > 0 && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-xs text-muted-foreground">
                              {session.message_count} msg
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
