import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, Phone, Sparkles, Settings, Clock, Users, Zap } from "lucide-react";
import { VoiceAgentChat } from "@/components/voice/VoiceAgentChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const USE_CASES = [
  {
    icon: Users,
    title: 'Team Meetings',
    description: 'Have voice meetings with AI. Discuss complex topics, iterate on ideas in real-time like talking to a colleague.',
    stat: '3x faster than typing',
  },
  {
    icon: Sparkles,
    title: 'Creative Brainstorming',
    description: 'Talk through ideas naturally. AI understands interruptions, context switches, and follows your train of thought.',
    stat: '95% natural quality',
  },
  {
    icon: Clock,
    title: 'While Multitasking',
    description: 'Get work done hands-free. Talk to AI while cooking, driving, or doing other tasks.',
    stat: 'Works anywhere',
  },
  {
    icon: Zap,
    title: 'Customer Support',
    description: '24/7 natural conversations that handle inquiries, resolve issues, and escalate complex cases with empathy.',
    stat: '89% automation',
  },
];

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
      <SEO 
        title="Voice AI - Have Meetings, Not Messages | Natural Conversations"
        description="Stop typing. Start talking. Natural voice conversations with AI that understands interruptions, context switches, and complex discussions. 3x faster than typing. Powered by ElevenLabs."
        keywords="voice AI, ElevenLabs, conversational AI, natural voice, speech recognition, voice meetings, talk to AI, conversational interface, voice assistant"
        canonical="https://oneiros.me/voice-agent"
        ogImage="/og-voice-v2.png"
      />
      <div className="container mx-auto py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by ElevenLabs
          </Badge>
          <div className="flex items-center justify-center gap-3">
            <Phone className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Voice AI - Have Meetings, Not Messages</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <strong>Stop typing. Start talking.</strong> Natural back-and-forth conversations with AI. 
            Handles interruptions, understands context switches, and feels human. Talk like you're in a meeting with a colleague.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>3x faster than typing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-primary" />
              <span>Natural interruptions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>5-minute setup</span>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Why Voice?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Voice AI makes complex discussions feel natural and human
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <Card key={useCase.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">{useCase.stat}</Badge>
                    </div>
                    <h3 className="font-semibold">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue={isConfigured ? "chat" : "setup"} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
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
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Your Voice Agent</CardTitle>
                  <CardDescription>
                    Connect your ElevenLabs agent to enable natural voice conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="agentId">ElevenLabs Agent ID</Label>
                    <Input
                      id="agentId"
                      placeholder="your-agent-id-here"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Find your agent ID in the ElevenLabs Conversational AI dashboard
                    </p>
                  </div>

                  <Button onClick={handleConfigure} className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Connect Agent
                  </Button>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      5-Minute Setup - Unlock Unlimited Voice Conversations
                    </h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">1.</span>
                        <span>Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener" className="text-primary hover:underline">elevenlabs.io</a> and create an account (free tier available)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">2.</span>
                        <span>Navigate to "Conversational AI" and create your agent with custom personality</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">3.</span>
                        <span>Configure voice, language, and knowledge base in ElevenLabs dashboard</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">4.</span>
                        <span>Copy the Agent ID and paste it above to connect</span>
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Built-in Tools
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="justify-center">🖼️ Generate Images</Badge>
                      <Badge variant="outline" className="justify-center">📈 Get Trends</Badge>
                      <Badge variant="outline" className="justify-center">🔗 Trigger Integrations</Badge>
                      <Badge variant="outline" className="justify-center">📚 Search Knowledge</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your voice agent can invoke these tools during conversations automatically
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <p className="font-semibold">From Support Calls to Creative Brainstorms</p>
                      <p className="text-sm text-muted-foreground">
                        Voice makes AI feel human. Perfect for customer support, team collaboration, content creation, 
                        and any scenario where typing slows you down. Access from sidebar anytime with full platform integration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            {isConfigured && <VoiceAgentChat agentId={agentId} />}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
