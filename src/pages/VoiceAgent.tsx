import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mic, Phone, Sparkles, Settings, Clock, Users, Zap, AlertCircle, Chrome } from "lucide-react";
import { VoiceAgentChat } from "@/components/voice/VoiceAgentChat";
import { GrokVoiceAgent } from "@/components/voice/GrokVoiceAgent";
import { ScrollableTabs, TabsContent } from "@/components/ui/scrollable-tabs";
import { SEO } from "@/components/SEO";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/stripe/UpgradePrompt";

const USE_CASES = [
  {
    icon: Users,
    title: 'Team Meetings',
    description: 'Have voice meetings with AI. Discuss complex topics in real-time.',
    stat: '3x faster',
  },
  {
    icon: Sparkles,
    title: 'Brainstorming',
    description: 'Talk through ideas naturally. AI follows your train of thought.',
    stat: '95% natural',
  },
  {
    icon: Clock,
    title: 'Multitasking',
    description: 'Get work done hands-free while cooking, driving, or exercising.',
    stat: 'Anywhere',
  },
  {
    icon: Zap,
    title: 'Support',
    description: '24/7 natural conversations that handle inquiries with empathy.',
    stat: '89% auto',
  },
];

const TABS = [
  { value: "grok", label: "Grok (Eros)", shortLabel: "Eros", icon: <Sparkles className="w-4 h-4" /> },
  { value: "setup", label: "ElevenLabs Setup", shortLabel: "Setup", icon: <Settings className="w-4 h-4" /> },
  { value: "chat", label: "ElevenLabs Chat", shortLabel: "Chat", icon: <Mic className="w-4 h-4" />, disabled: false },
];

export default function VoiceAgent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { canAccess, requiredTier } = useFeatureAccess("voiceAI");
  const [agentId, setAgentId] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState("grok");
  const [browserWarning, setBrowserWarning] = useState<string | null>(null);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
    const hasSpeechRecognition = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

    if (isIOS) {
      setBrowserWarning('iOS Safari has limited voice support. For best results, use the ElevenLabs tab or try Chrome on desktop.');
    } else if (!hasSpeechRecognition) {
      setBrowserWarning('Your browser doesn\'t support speech recognition. Please use Chrome or the ElevenLabs tab.');
    } else if (!isChrome) {
      setBrowserWarning('For the best experience, we recommend using Google Chrome.');
    }
  }, []);

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

  // Update tabs based on configuration
  const tabs = TABS.map(tab => 
    tab.value === "chat" ? { ...tab, disabled: !isConfigured } : tab
  );

  return (
    <ErrorBoundaryWrapper
      fallbackTitle="Voice Agent Error"
      fallbackMessage="The voice agent encountered an error. This may be due to browser compatibility or microphone permissions."
    >
      <PageLayout title="Voice AI" showBack>
        <SEO 
          title="Voice AI - Have Meetings, Not Messages | Natural Conversations"
          description="Stop typing. Start talking. Natural voice conversations with AI that understands interruptions, context switches, and complex discussions. 3x faster than typing. Powered by ElevenLabs."
          keywords="voice AI, ElevenLabs, conversational AI, natural voice, speech recognition, voice meetings, talk to AI, conversational interface, voice assistant"
          canonical="https://oneiros.me/voice-agent"
          ogImage="/og-platform-automation.png"
        />
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6 md:space-y-8">
          {/* Browser Compatibility Alert */}
          {browserWarning && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium">Browser Notice</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm">{browserWarning}</span>
                {!(/Chrome/i.test(navigator.userAgent)) && (
                  <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                    <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
                      <Chrome className="mr-2 h-4 w-4" />
                      Get Chrome
                    </a>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Hero - Condensed on Mobile */}
          <div className="text-center space-y-4 md:space-y-6">
            <Badge variant="secondary" className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Powered by ElevenLabs
            </Badge>
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <Phone className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <h1 className="text-2xl md:text-4xl font-bold">Voice AI</h1>
            </div>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              <strong>Stop typing. Start talking.</strong> Natural conversations that feel human.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                <span>3x faster</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                <span>Natural interruptions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                <span>5-min setup</span>
              </div>
            </div>
          </div>

          {/* Use Cases - 2x2 Grid on Mobile */}
          <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-bold">Why Voice?</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {USE_CASES.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <Card key={useCase.title} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px] md:text-xs">{useCase.stat}</Badge>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{useCase.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{useCase.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Feature Gate Check */}
          {!canAccess && requiredTier && (
            <UpgradePrompt 
              feature="Voice AI" 
              requiredTier={requiredTier} 
              variant="card" 
            />
          )}

          {/* Main Interface - Only show if user has access */}
          {canAccess && (
            <ScrollableTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} maxWidth="max-w-2xl">
              <TabsContent value="grok">
                {user ? (
                  <GrokVoiceAgent />
                ) : (
                  <Card className="p-6 md:p-8 text-center">
                    <p className="text-muted-foreground">Please sign in to access Eros Voice Interface</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="setup">
                <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg md:text-xl">Configure Your Voice Agent</CardTitle>
                      <CardDescription className="text-sm">
                        Connect your ElevenLabs agent to enable natural voice conversations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="agentId" className="text-sm md:text-base">ElevenLabs Agent ID</Label>
                        <Input
                          id="agentId"
                          placeholder="your-agent-id-here"
                          value={agentId}
                          onChange={(e) => setAgentId(e.target.value)}
                          className="h-12 md:h-14 text-base"
                        />
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Find your agent ID in the ElevenLabs Conversational AI dashboard
                        </p>
                      </div>

                      <Button onClick={handleConfigure} className="w-full h-12 md:h-14 text-base" size="lg">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Connect Agent
                      </Button>

                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          5-Minute Setup
                        </h4>
                        <ol className="space-y-2 text-xs md:text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="font-semibold text-foreground">1.</span>
                            <span>Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener" className="text-primary hover:underline">elevenlabs.io</a> (free tier available)</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold text-foreground">2.</span>
                            <span>Navigate to "Conversational AI" and create your agent</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold text-foreground">3.</span>
                            <span>Configure voice, language, and knowledge base</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold text-foreground">4.</span>
                            <span>Copy the Agent ID and paste it above</span>
                          </li>
                        </ol>
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Built-in Tools
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge variant="outline" className="justify-center text-xs py-2">🖼️ Images</Badge>
                          <Badge variant="outline" className="justify-center text-xs py-2">📈 Trends</Badge>
                          <Badge variant="outline" className="justify-center text-xs py-2">🔗 Integrations</Badge>
                          <Badge variant="outline" className="justify-center text-xs py-2">📚 Knowledge</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                {isConfigured && <VoiceAgentChat agentId={agentId} />}
              </TabsContent>
            </ScrollableTabs>
          )}
        </div>
      </PageLayout>
    </ErrorBoundaryWrapper>
  );
}
