import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { Plus, MessageSquare, Search, Trash2, Download, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  last_message_at: string | null;
}

interface EnhancedSessionSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const EnhancedSessionSidebar = ({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession 
}: EnhancedSessionSidebarProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();

    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSessions(sessions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSessions(
        sessions.filter(
          (s) =>
            s.title?.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, sessions]);

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

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Delete interactions first (foreign key constraint)
      await supabase.from("interactions").delete().eq("session_id", sessionId);
      
      // Then delete the session
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session deleted",
        description: "The session and its messages have been removed.",
      });

      if (currentSessionId === sessionId) {
        onNewSession();
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportSession = async (sessionId: string) => {
    try {
      const { data: interactions, error } = await supabase
        .from("interactions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const session = sessions.find((s) => s.id === sessionId);
      const exportData = {
        session: {
          id: sessionId,
          title: session?.title || "Untitled Session",
          created_at: session?.created_at,
          last_message_at: session?.last_message_at,
        },
        interactions: interactions.map((i) => ({
          timestamp: i.created_at,
          message: i.message,
          response: i.response,
          quality_rating: i.quality_rating,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${sessionId.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Session exported",
        description: "Your session has been downloaded as JSON.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to export session",
        description: error.message,
        variant: "destructive",
      });
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
    <>
      <div className="w-72 border-r border-border bg-card h-full flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <Button onClick={onNewSession} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <InputWithClear
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              className="pl-8 h-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              <p className="text-sm text-muted-foreground p-2">Loading...</p>
            ) : filteredSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">
                {searchQuery ? "No matching sessions" : "No sessions yet"}
              </p>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative rounded-md transition-colors ${
                    currentSessionId === session.id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <button
                    onClick={() => onSessionSelect(session.id)}
                    className="w-full text-left p-2 rounded-md"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.title || "New conversation"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(session.last_message_at || session.created_at)}</span>
                          <span>•</span>
                          <span>{session.message_count} msgs</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSession(session.id);
                      }}
                      title="Export session"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSessionId(session.id);
                      }}
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone and will
              remove all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSessionId) {
                  handleDeleteSession(deleteSessionId);
                  setDeleteSessionId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
