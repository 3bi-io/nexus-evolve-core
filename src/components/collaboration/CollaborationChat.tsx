import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Code, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'file' | 'code' | 'system';
  metadata: any;
  created_at: string;
}

interface CollaborationChatProps {
  sessionId: string;
}

export function CollaborationChat({ sessionId }: CollaborationChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = (await supabase
      .from('collaboration_messages' as any)
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })) as any;

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('collaboration-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_messages',
          filter: `session_id=eq.${sessionId}`,
        } as any,
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const { error } = (await supabase
      .from('collaboration_messages' as any)
      .insert({
        session_id: sessionId,
        user_id: user.id,
        message: newMessage,
        message_type: 'text',
      })) as any;

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
      return;
    }

    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Collaboration Chat</h3>
        <p className="text-sm text-muted-foreground">
          Real-time messaging with team members
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {msg.user_id.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`inline-block max-w-[70%] rounded-lg p-3 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {getMessageIcon(msg.message_type) && (
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      {getMessageIcon(msg.message_type)}
                      <span className="text-xs capitalize">{msg.message_type}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-3">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
