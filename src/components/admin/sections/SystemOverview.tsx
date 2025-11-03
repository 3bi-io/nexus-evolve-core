import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Database, Brain, MessageSquare, Users, Bot, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemOverview() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    knowledge: 0,
    memories: 0,
    interactions: 0,
    sessions: 0,
    users: 0,
    agents: 0,
    credits: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [knowledge, memories, interactions, sessions, agents] = await Promise.all([
        supabase.from("knowledge_base").select("*", { count: "exact", head: true }),
        supabase.from("agent_memory").select("*", { count: "exact", head: true }),
        supabase.from("interactions").select("*", { count: "exact", head: true }),
        supabase.from("sessions").select("*", { count: "exact", head: true }),
        supabase.from("custom_agents").select("*", { count: "exact", head: true }),
      ]);

      // Get user count from auth
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

      setStats({
        knowledge: knowledge.count || 0,
        memories: memories.count || 0,
        interactions: interactions.count || 0,
        sessions: sessions.count || 0,
        users: authUsers?.length || 0,
        agents: agents.count || 0,
        credits: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-mobile">
      <div className={cn(
        "flex flex-col sm:flex-row",
        "items-start sm:items-center justify-between",
        "gap-4 mb-6 sm:mb-8"
      )}>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">System Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Real-time platform statistics</p>
        </div>
        <Button 
          onClick={loadStats} 
          variant="outline" 
          size="default"
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[36px]"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className={cn(
        "grid gap-4 sm:gap-6",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4"
      )}>
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold">{stats.users.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Created by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledge.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In knowledge base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memories</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Stored memories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overall platform health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Edge Functions</span>
                <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Services</span>
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                View All Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bot className="w-4 h-4 mr-2" />
                Moderate Agents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Revenue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
