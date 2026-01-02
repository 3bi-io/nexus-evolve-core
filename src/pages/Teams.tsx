import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Plus,
  Mail,
  Crown,
  Shield,
  Eye,
  Settings,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase.from('team_members').insert({
        team_id: data.id,
        user_id: user?.id,
        role: 'owner',
      });

      toast.success('Team created successfully');
      setNewTeamName('');
      fetchTeams();
    } catch (error: any) {
      toast.error('Failed to create team');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <AuthGuard featureName="team management">
    <PageLayout title="Teams">
      <SEO
        title="Team Management - Oneiros AI"
        description="Manage your teams and collaborate with members"
        keywords="teams, collaboration, enterprise"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your teams and members
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Users className="h-4 w-4" />
            {teams.length} Team(s)
          </Badge>
        </div>

        {/* Create New Team */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Create New Team</h2>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Enter team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
                className="flex-1"
              />
              <Button onClick={createTeam}>Create Team</Button>
            </div>
          </div>
        </Card>

        {/* Teams List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <Card className="p-6 col-span-full text-center">
              <p className="text-muted-foreground">Loading teams...</p>
            </Card>
          ) : teams.length === 0 ? (
            <Card className="p-12 col-span-full text-center space-y-4">
              <Users className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Teams Yet</h3>
                <p className="text-muted-foreground">
                  Create your first team to start collaborating
                </p>
              </div>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(team.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {team.owner_id === user?.id && (
                    <Badge variant="outline" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {team.member_count || 1}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {team.member_count || 1} member(s)
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    View Members
                  </Button>
                  {team.owner_id === user?.id && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Invite Section */}
                {team.owner_id === user?.id && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Email to invite..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Control permissions with owner, admin, member, and viewer roles
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Easy Invites</h3>
            <p className="text-sm text-muted-foreground">
              Invite team members via email with a single click
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Unlimited Members</h3>
            <p className="text-sm text-muted-foreground">
              Add as many team members as you need
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
    </AuthGuard>
  );
}
