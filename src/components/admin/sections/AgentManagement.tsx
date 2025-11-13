import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAudit } from "@/hooks/useAdminAudit";
import { useToast } from "@/hooks/use-toast";
import { Bot, Search, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

export function AgentManagement() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { logAction } = useAdminAudit();
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAgents(data);
    }
    setLoading(false);
  };

  const toggleFeatured = async (agentId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("custom_agents")
      .update({ is_template: !currentStatus })
      .eq("id", agentId);

    if (!error) {
      await logAction({
        action_type: "toggle_featured_agent",
        target_type: "agent",
        target_id: agentId,
        details: { featured: !currentStatus },
      });
      toast({ title: "Success", description: "Agent featured status updated" });
      fetchAgents();
    }
  };

  const toggleVisibility = async (agentId: string, currentIsPublic: boolean) => {
    const { error } = await supabase
      .from("custom_agents")
      .update({ is_public: !currentIsPublic })
      .eq("id", agentId);

    if (!error) {
      await logAction({
        action_type: "toggle_agent_visibility",
        target_type: "agent",
        target_id: agentId,
        details: { is_public: !currentIsPublic },
      });
      toast({ title: "Success", description: "Agent visibility updated" });
      fetchAgents();
    }
  };

  const deleteAgent = async (agentId: string) => {
    const { error } = await supabase
      .from("custom_agents")
      .delete()
      .eq("id", agentId);

    if (!error) {
      await logAction({
        action_type: "delete_agent",
        target_type: "agent",
        target_id: agentId,
      });
      toast({ title: "Success", description: "Agent deleted" });
      setDeleteTarget(null);
      fetchAgents();
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent Management</h1>
        <p className="text-muted-foreground">Manage and moderate AI agents</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            All Agents
          </CardTitle>
          <CardDescription>
            Total: {agents.length} | Featured: {agents.filter(a => a.is_template).length} | Public: {agents.filter(a => a.is_public).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <InputWithClear
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{agent.name}</h3>
                          {agent.is_template && (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant={agent.is_public ? "default" : "outline"}>
                            {agent.is_public ? "public" : "private"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Uses: {agent.usage_count || 0}</span>
                          <span>Rating: {agent.rating_avg ? agent.rating_avg.toFixed(1) : 'N/A'} ({agent.rating_count || 0})</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeatured(agent.id, agent.is_template)}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVisibility(agent.id, agent.is_public)}
                        >
                          {agent.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(agent.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteAgent(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
