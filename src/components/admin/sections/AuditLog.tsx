import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileWarning, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
    
    const channel = supabase
      .channel("admin_actions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_actions" },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) =>
    log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (actionType: string) => {
    if (actionType.includes("delete")) return "destructive";
    if (actionType.includes("create") || actionType.includes("add")) return "default";
    if (actionType.includes("update") || actionType.includes("toggle")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-mobile">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Audit Log</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Real-time admin action tracking</p>
      </div>

      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="w-5 h-5" />
            Admin Actions
          </CardTitle>
          <CardDescription>Recent administrative activities (last 100 actions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <InputWithClear
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                className="pl-10 min-h-[48px] sm:min-h-[40px]"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={getActionColor(log.action_type)}>
                            {log.action_type.replace(/_/g, " ")}
                          </Badge>
                          {log.target_type && (
                            <Badge variant="outline">{log.target_type}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "PPpp")}
                          {log.ip_address && ` • IP: ${log.ip_address}`}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No audit logs found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
