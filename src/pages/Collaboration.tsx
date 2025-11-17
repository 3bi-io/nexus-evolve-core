import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoading } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollaborationChat } from '@/components/collaboration/CollaborationChat';
import {
  Users,
  Plus,
  Share2,
  MessageSquare,
  Video,
  Clock,
  Settings,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const sessionNameSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Session name is required')
    .max(200, 'Session name must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Invalid characters in session name')
});

interface SharedSession {
  id: string;
  name: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  participant_count?: number;
}

export default function Collaboration() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SharedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    if (user) {
      fetchSessions();
      subscribeToSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSessions = () => {
    const channel = supabase
      .channel('shared_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_sessions',
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createSession = async () => {
    if (!newSessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    // Validate input
    const validation = sessionNameSchema.safeParse({ name: newSessionName });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shared_sessions')
        .insert({
          name: validation.data.name,
          owner_id: user?.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await supabase.from('session_participants').insert({
        session_id: data.id,
        user_id: user?.id,
      });

      toast.success('Session created successfully');
      setNewSessionName('');
      fetchSessions();
    } catch (error: any) {
      toast.error('Failed to create session');
    }
  };

  return (
    <AppLayout title="Collaboration" showBottomNav>
      <SEO
        title="Real-Time Collaboration - Oneiros AI"
        description="Collaborate with your team in real-time AI sessions"
        keywords="collaboration, team AI, shared sessions"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Collaboration Hub</h1>
            <p className="text-muted-foreground mt-2">
              Work together in real-time AI sessions
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Users className="h-4 w-4" />
            {sessions.length} Active Sessions
          </Badge>
        </div>

        {/* Create New Session */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Create New Session</h2>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Enter session name..."
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSession()}
                className="flex-1"
              />
              <Button onClick={createSession}>Create Session</Button>
            </div>
          </div>
        </Card>

        {/* Sessions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <PageLoading />
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No Active Sessions"
              description="Create your first collaboration session to get started"
              className="col-span-full"
            />
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{session.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {session.is_public && (
                    <Badge variant="outline" className="gap-1">
                      <Share2 className="h-3 w-3" />
                      Public
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.participant_count || 1}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {session.participant_count || 1} participant(s)
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                  {session.owner_id === user?.id && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Live Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together in real-time with synchronized AI conversations
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Team Management</h3>
            <p className="text-sm text-muted-foreground">
              Invite team members and manage permissions easily
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Share Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Make sessions public or share with specific team members
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
