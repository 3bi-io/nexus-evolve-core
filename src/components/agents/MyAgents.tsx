import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trash2, Edit, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  description: string;
  tools_enabled: string[];
  is_public: boolean;
  usage_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export function MyAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase.from('custom_agents').delete().eq('id', id);
      if (error) throw error;

      setAgents(agents.filter((a) => a.id !== id));
      toast.success('Agent deleted');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first custom agent to get started
        </p>
        <Button onClick={() => navigate('/agents?tab=create')}>Create Agent</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card key={agent.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                {agent.is_public && (
                  <Badge variant="outline">Public</Badge>
                )}
              </div>
              {agent.description && (
                <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {agent.tools_enabled.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{agent.usage_count} uses</span>
                {agent.rating_count > 0 && (
                  <span>
                    ⭐ {agent.rating_avg.toFixed(1)} ({agent.rating_count})
                  </span>
                )}
                <span>
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/agents?tab=create&edit=${agent.id}`)}
                title="Edit Agent"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/agent-executor/${agent.id}`)}
                title="Open Agent Chat"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(agent.id)}
                title="Delete Agent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
