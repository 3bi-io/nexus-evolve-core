import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Session {
  id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  last_message_at: string | null;
}

interface SessionSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const SessionSidebar = ({ currentSessionId, onSessionSelect, onNewSession }: SessionSidebarProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load sessions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) return "Today";
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString();
  };

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={onNewSession} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground p-2">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No sessions yet</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  currentSessionId === session.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.title || "New conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.last_message_at || session.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
