import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Database, Brain, MessageSquare, RefreshCw, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DataManagement() {
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

  useEffect(() => {
    loadStats();
  }, []);

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

  return (
    <div className="space-mobile">
      <div className={cn(
        "flex flex-col sm:flex-row",
        "items-start sm:items-center justify-between",
        "gap-4 mb-6 sm:mb-8"
      )}>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Data Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage knowledge, memories, and system data</p>
        </div>
        <Button 
          onClick={loadStats} 
          variant="outline" 
          size="default"
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[36px]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Manage all knowledge entries</CardDescription>
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
            <CardDescription>Manage all agent memories</CardDescription>
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
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
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
    </div>
  );
}
