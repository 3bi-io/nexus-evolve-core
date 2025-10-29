import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, Settings } from "lucide-react";
import { VoiceAgentChat } from "@/components/voice/VoiceAgentChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VoiceAgent() {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  const handleConfigure = () => {
    if (!agentId.trim()) {
      toast({
        title: "Agent ID required",
        description: "Please enter your ElevenLabs agent ID",
        variant: "destructive",
      });
      return;
    }

    setIsConfigured(true);
    toast({
      title: "Agent configured",
      description: "You can now start a voice conversation",
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Phone className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Voice Agent</h1>
            <p className="text-muted-foreground">
              Conversational AI powered by ElevenLabs with real-time voice interaction
            </p>
          </div>
        </div>

        <Tabs defaultValue={isConfigured ? "chat" : "setup"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="setup" className="gap-2">
              <Settings className="w-4 h-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={!isConfigured}>
              <Mic className="w-4 h-4" />
              Voice Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Configure ElevenLabs Agent</CardTitle>
                <CardDescription>
                  Enter your ElevenLabs agent ID to enable voice conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input
                    id="agentId"
                    placeholder="your-agent-id"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get your agent ID from the ElevenLabs dashboard
                  </p>
                </div>

                <Button onClick={handleConfigure} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Configure Agent
                </Button>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold">How to get your Agent ID:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Go to ElevenLabs dashboard</li>
                    <li>Navigate to Conversational AI</li>
                    <li>Create or select an agent</li>
                    <li>Copy the agent ID from the settings</li>
                  </ol>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold">Available Client Tools:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Generate Image</Badge>
                    <Badge variant="outline">Get Trends</Badge>
                    <Badge variant="outline">Trigger Integration</Badge>
                    <Badge variant="outline">Search Knowledge</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The agent can invoke these tools during conversation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            {isConfigured && <VoiceAgentChat agentId={agentId} />}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
