import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Database, Brain, MessageSquare, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    knowledge: 0,
    memories: 0,
    interactions: 0,
    sessions: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "knowledge" | "memories" | "all" | null;
  }>({ open: false, type: null });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadStats();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    setIsAdmin(!!data && !error);
  };

  const loadStats = async () => {
    const [knowledge, memories, interactions, sessions] = await Promise.all([
      supabase.from("knowledge_base").select("*", { count: "exact", head: true }),
      supabase.from("agent_memory").select("*", { count: "exact", head: true }),
      supabase.from("interactions").select("*", { count: "exact", head: true }),
      supabase.from("sessions").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      knowledge: knowledge.count || 0,
      memories: memories.count || 0,
      interactions: interactions.count || 0,
      sessions: sessions.count || 0,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.type) return;

    setLoading(true);
    try {
      if (deleteDialog.type === "knowledge") {
        const { error } = await supabase.from("knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        toast({ title: "Success", description: "All knowledge deleted" });
      } else if (deleteDialog.type === "memories") {
        const { error } = await supabase.from("agent_memory").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        toast({ title: "Success", description: "All memories deleted" });
      } else if (deleteDialog.type === "all") {
        await Promise.all([
          supabase.from("knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("agent_memory").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("interactions").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
        ]);
        toast({ title: "Success", description: "All system data deleted" });
      }
      await loadStats();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete data", variant: "destructive" });
      console.error(error);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, type: null });
    }
  };

  if (!isAdmin) {
    return (
      <PageLayout>
        <SEO 
          title="Super Admin - System Management & Data Control"
          description="Super admin dashboard for managing system knowledge, memories, interactions, and sessions. Access restricted to authorized administrators only."
          canonical="https://oneiros.me/super-admin"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have super admin privileges.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO 
        title="Super Admin - System Management & Data Control"
        description="Super admin dashboard for managing system knowledge, memories, interactions, and sessions. Monitor stats and perform administrative operations."
        canonical="https://oneiros.me/super-admin"
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Super Admin</h1>
            <p className="text-muted-foreground">Manage system knowledge and memory</p>
          </div>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.knowledge}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memories</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessions}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Management</CardTitle>
              <CardDescription>
                Manage all knowledge entries across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Entries</p>
                  <p className="text-sm text-muted-foreground">{stats.knowledge} knowledge entries</p>
                </div>
                <Badge variant="secondary">{stats.knowledge}</Badge>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialog({ open: true, type: "knowledge" })}
                disabled={stats.knowledge === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Knowledge
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory Management</CardTitle>
              <CardDescription>
                Manage all agent memories across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Memories</p>
                  <p className="text-sm text-muted-foreground">{stats.memories} memory entries</p>
                </div>
                <Badge variant="secondary">{stats.memories}</Badge>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialog({ open: true, type: "memories" })}
                disabled={stats.memories === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Memories
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will permanently delete all system data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={() => setDeleteDialog({ open: true, type: "all" })}
              disabled={stats.knowledge + stats.memories + stats.interactions + stats.sessions === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All System Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will delete all knowledge, memories, interactions, and sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {deleteDialog.type === "knowledge" && "all knowledge entries"}
              {deleteDialog.type === "memories" && "all memory entries"}
              {deleteDialog.type === "all" && "all system data including knowledge, memories, interactions, and sessions"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
