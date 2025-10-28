import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Zap, Settings, Trash2 } from "lucide-react";

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Capability Registry</h1>
              <p className="text-muted-foreground">Manage dynamic features and modules</p>
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Zap className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No capabilities yet</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first capability to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
