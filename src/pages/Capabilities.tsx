import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Plus, Zap, Settings, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/layout/PageLayout";

type Capability = {
  id: string;
  capability_name: string;
  description: string | null;
  is_enabled: boolean;
  usage_count: number;
  created_at: string;
};

export default function Capabilities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCapability, setNewCapability] = useState({ name: "", description: "" });

  const loadCapabilities = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("capability_modules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapabilities(data || []);
    } catch (error) {
      console.error("Error loading capabilities:", error);
      toast({
        title: "Failed to load capabilities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCapabilities();
  }, [user]);

  const createCapability = async () => {
    if (!user || !newCapability.name.trim()) {
      toast({ title: "Please enter a capability name", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("capability_modules").insert({
        user_id: user.id,
        capability_name: newCapability.name,
        description: newCapability.description,
        is_enabled: true,
        usage_count: 0,
      });

      if (error) throw error;

      toast({ title: "Capability created" });
      setNewCapability({ name: "", description: "" });
      setIsDialogOpen(false);
      loadCapabilities();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Failed to create capability", variant: "destructive" });
    }
  };

  const toggleCapability = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("capability_modules")
        .update({ is_enabled: !currentState })
        .eq("id", id);

      if (error) throw error;

      toast({ title: `Capability ${!currentState ? "enabled" : "disabled"}` });
      loadCapabilities();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Failed to update capability", variant: "destructive" });
    }
  };

  const deleteCapability = async (id: string) => {
    try {
      const { error } = await supabase.from("capability_modules").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Capability deleted" });
      loadCapabilities();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Failed to delete capability", variant: "destructive" });
    }
  };

  return (
    <PageLayout title="Capabilities" showBack={true} showBottomNav={true}>
      <SEO
        title="Capability Registry - Dynamic AI Feature Discovery & Management"
        description="Discover and manage dynamic AI capabilities. Your AI automatically discovers new features based on usage patterns and conversation context."
        keywords="AI capabilities, feature discovery, dynamic features, AI module management"
        canonical="https://oneiros.me/capabilities"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Capability Registry</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage dynamic features and modules</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Capability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Capability</DialogTitle>
                <DialogDescription>Add a new feature or module to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Capability Name</label>
                  <Input
                    placeholder="e.g., Advanced Math Solver"
                    value={newCapability.name}
                    onChange={(e) => setNewCapability({ ...newCapability, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Describe what this capability does..."
                    value={newCapability.description}
                    onChange={(e) => setNewCapability({ ...newCapability, description: e.target.value })}
                  />
                </div>
                <Button onClick={createCapability} className="w-full">
                  Create Capability
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Settings className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : capabilities.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Discover Your AI's Capabilities"
            description="As you interact with your AI, it will automatically discover new capabilities based on your conversations. Check back after a few chats to see what it can do!"
            action={{
              label: "Start Chatting",
              onClick: () => navigate('/chat')
            }}
            mockup={
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary/30" />
                </div>
                <div className="h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary/30" />
                </div>
                <div className="h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary/30" />
                </div>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {capabilities.map((capability) => (
              <Card key={capability.id} className={capability.is_enabled ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {capability.capability_name}
                        {capability.is_enabled ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">{capability.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Used <span className="font-semibold text-foreground">{capability.usage_count}</span> times
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCapability(capability.id, capability.is_enabled)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        {capability.is_enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCapability(capability.id)}
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
      </div>
    </PageLayout>
  );
}
