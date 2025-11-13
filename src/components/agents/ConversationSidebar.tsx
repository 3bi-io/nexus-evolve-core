import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { Search, MessageSquare, Pin, Archive, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  agentId: string;
  currentConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export const ConversationSidebar = ({
  agentId,
  currentConversationId,
  onConversationSelect,
  onNewConversation
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-conversation', {
        body: { action: 'list', agentId }
      });

      if (error) throw error;
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [agentId]);

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ is_pinned: !isPinned })
        .eq('id', id);

      if (error) throw error;
      fetchConversations();
    } catch (error) {
      console.error('Error pinning conversation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-conversation', {
        body: { action: 'delete', conversationId: id }
      });

      if (error) throw error;
      fetchConversations();
      toast({
        title: "Deleted",
        description: "Conversation deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(c => c.is_pinned);
  const regularConversations = filteredConversations.filter(c => !c.is_pinned && !c.is_archived);

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 space-y-4">
        <Button onClick={onNewConversation} className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          New Conversation
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <InputWithClear
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {pinnedConversations.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Pinned
                </div>
                {pinnedConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={() => onConversationSelect(conv)}
                    onPin={() => handlePin(conv.id, conv.is_pinned)}
                    onDelete={() => handleDelete(conv.id)}
                  />
                ))}
              </div>
            )}

            {regularConversations.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Recent
                </div>
                {regularConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={() => onConversationSelect(conv)}
                    onPin={() => handlePin(conv.id, conv.is_pinned)}
                    onDelete={() => handleDelete(conv.id)}
                  />
                ))}
              </div>
            )}

            {filteredConversations.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
}

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onPin,
  onDelete
}: ConversationItemProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-primary/10' : 'hover:bg-accent'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {conversation.is_pinned && <Pin className="w-3 h-3 text-primary" />}
            <p className="font-medium text-sm truncate">{conversation.title || 'Untitled'}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
          </p>
          <p className="text-xs text-muted-foreground">
            {conversation.messages.length} messages
          </p>
        </div>

        {showActions && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={onPin}
              className="h-6 w-6 p-0"
            >
              <Pin className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
