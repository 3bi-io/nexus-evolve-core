import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecurityCenter() {
  return (
    <div className="space-mobile">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Security Center</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor security and RLS policies</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              RLS Status
            </CardTitle>
            <CardDescription>Row Level Security policy status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tables with RLS</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Policy Coverage</span>
                <Badge className="bg-green-500">100%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Alerts
            </CardTitle>
            <CardDescription>Recent security events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No security alerts at this time.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Authentication
            </CardTitle>
            <CardDescription>Auth configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Auth</span>
                <Badge className="bg-green-500">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions Log</CardTitle>
            <CardDescription>Recent administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent admin actions logged.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
