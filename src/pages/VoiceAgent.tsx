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
    title: 'Customer Support',
    description: '24/7 voice support that handles inquiries, resolves issues, and escalates complex cases.',
    stat: '89% automation',
  },
  {
    icon: Clock,
    title: 'Scheduling & Reminders',
    description: 'Voice-based calendar management, meeting scheduling, and automated reminders.',
    stat: 'Saves 12h/week',
  },
  {
    icon: Sparkles,
    title: 'Content Creation',
    description: 'Brainstorm ideas, draft content, and refine messaging through natural conversation.',
    stat: '3x faster writing',
  },
  {
    icon: Zap,
    title: 'Quick Research',
    description: 'Ask questions, get instant answers, and have AI search your knowledge base.',
    stat: 'Instant results',
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
        title="Voice AI - Have Conversations, Not Chats | 5-Minute Setup"
        description="Natural voice conversations with AI. Real-time speech recognition, intelligent responses, function calling. Talk to AI like talking to a person. Powered by ElevenLabs."
        keywords="voice AI, ElevenLabs, conversational AI, voice agent, speech recognition, text to speech, voice chatbot, natural language"
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
            <h1 className="text-4xl font-bold">Voice AI Agent</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have <strong>conversations</strong>, not chats. Natural voice interactions with AI that understands context, 
            invokes tools, and responds like a real person.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-primary" />
              <span>Real-time speech</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>Function calling</span>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Perfect For</h2>
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
                      Quick Setup Guide
                    </h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">1.</span>
                        <span>Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener" className="text-primary hover:underline">elevenlabs.io</a> and sign in</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">2.</span>
                        <span>Navigate to "Conversational AI" section</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">3.</span>
                        <span>Create a new agent or select an existing one</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">4.</span>
                        <span>Copy the Agent ID from settings and paste it above</span>
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
                      <p className="font-semibold">Pro Tip</p>
                      <p className="text-sm text-muted-foreground">
                        Configure your agent's personality, voice, and knowledge base in ElevenLabs. 
                        Then connect it here for instant voice interactions with all Oneiros capabilities.
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
