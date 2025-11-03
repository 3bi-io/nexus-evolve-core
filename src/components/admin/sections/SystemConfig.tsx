import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Flag } from "lucide-react";
import { Label } from "@/components/ui/label";

export function SystemConfig() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<any[]>([]);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("flag_name");

    if (!error && data) {
      setFlags(data);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">System Configuration</h1>
        <p className="text-muted-foreground">Manage feature flags and system settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>Enable or disable platform features globally</CardDescription>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature flags configured yet.</p>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={flag.id}>{flag.flag_name}</Label>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                  </div>
                  <Switch
                    id={flag.id}
                    checked={flag.is_enabled}
                    onCheckedChange={async (checked) => {
                      const { error } = await supabase
                        .from("feature_flags")
                        .update({ is_enabled: checked })
                        .eq("id", flag.id);
                      
                      if (!error) {
                        toast({ title: "Success", description: "Feature flag updated" });
                        loadFeatureFlags();
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Additional system configuration options coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
