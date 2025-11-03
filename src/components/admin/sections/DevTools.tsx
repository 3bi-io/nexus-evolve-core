import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Database, Terminal } from "lucide-react";

export function DevTools() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Developer Tools</h1>
        <p className="text-muted-foreground">Advanced tools for system developers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Edge Functions
            </CardTitle>
            <CardDescription>Monitor edge function status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Edge function monitoring coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Tools
            </CardTitle>
            <CardDescription>Database management utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Database tools coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              API Testing
            </CardTitle>
            <CardDescription>Test API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">API testing interface coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
