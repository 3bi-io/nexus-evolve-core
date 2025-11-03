import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Database, Code, Globe, Award, CheckCircle2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BetaTrustSignals = () => {
  const [realMetrics, setRealMetrics] = useState({
    users: 0,
    sessions: 0,
    interactions: 0,
  });

  // Fetch REAL metrics from database
  useEffect(() => {
    const fetchRealMetrics = async () => {
      try {
        // Get actual session count
        const { count: sessionCount } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true });

        // Get actual interaction count
        const { count: interactionCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true });

        // Get unique user count from sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('user_id');
        
        const uniqueUsers = sessions ? new Set(sessions.map(s => s.user_id)).size : 0;

        setRealMetrics({
          users: uniqueUsers,
          sessions: sessionCount || 0,
          interactions: interactionCount || 0,
        });
      } catch (error) {
        console.error('Error fetching real metrics:', error);
      }
    };

    fetchRealMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Beta Status Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <div>
                <div className="font-semibold">Beta Launch - Building in Public</div>
                <div className="text-sm text-muted-foreground">
                  {realMetrics.users} early testers • {realMetrics.sessions} sessions created • {realMetrics.interactions} AI interactions
                </div>
              </div>
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
              Join First 1,000 Users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Technical Proof - Real Infrastructure */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">68</div>
            <div className="text-xs text-muted-foreground">Production Tables</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <Code className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">20+</div>
            <div className="text-xs text-muted-foreground">Edge Functions</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">9</div>
            <div className="text-xs text-muted-foreground">AI Systems</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground">Functional</div>
          </CardContent>
        </Card>
      </div>

      {/* Beta Tester Testimonials (placeholder for real ones) */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Early Beta Tester</div>
                <Badge variant="secondary" className="text-xs">Beta Community</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Join our beta program and be featured here. Help us build something revolutionary."
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Cody Forbes</div>
                <Badge variant="secondary" className="text-xs">Founder</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Be among the first to experience multi-agent AI with temporal memory. Shape the product."
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Become a Pioneer</div>
                <Badge variant="secondary" className="text-xs">Early Access</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Get lifetime founder pricing, direct access to developers, and help shape features."
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real Tech Stack & Security */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Shield className="w-4 h-4" />
          Enterprise Security
        </Badge>
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Database className="w-4 h-4" />
          Supabase Backend
        </Badge>
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <CheckCircle2 className="w-4 h-4" />
          RLS Enabled
        </Badge>
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Code className="w-4 h-4" />
          Serverless Functions
        </Badge>
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Globe className="w-4 h-4" />
          Production Ready
        </Badge>
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Award className="w-4 h-4" />
          Beta Launch
        </Badge>
      </div>
    </div>
  );
};