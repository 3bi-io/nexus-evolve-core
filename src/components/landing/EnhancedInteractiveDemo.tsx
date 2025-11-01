import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  Image, 
  MessageSquare, 
  TrendingUp,
  Mic,
  Network,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useNavigate } from "react-router-dom";

const DEMO_PROMPTS = [
  {
    icon: MessageSquare,
    prompt: "Analyze this business idea and give me strategic insights",
    response: "I'll analyze your business idea using the Reasoning Agent for strategic insights and the Creative Agent for innovative angles. Let me break down market opportunity, competitive advantages, potential challenges, and growth strategies...",
    badge: "Multi-Agent",
    credits: 8
  },
  {
    icon: Mic,
    prompt: "Start a voice conversation about AI trends",
    response: "🎙️ Starting voice conversation with ElevenLabs integration... I can hear you clearly! Let's discuss the latest AI trends including multimodal models, autonomous agents, and real-time voice interactions with function calling...",
    badge: "Voice AI",
    credits: 12
  },
  {
    icon: Image,
    prompt: "Generate a futuristic city landscape at sunset",
    response: "🎨 Generating image using DALL-E 3... Creating a stunning futuristic cityscape with flying vehicles, neon lights, and a vibrant orange-purple sunset reflecting off glass buildings. Image ready in 8 seconds!",
    badge: "Image Gen",
    credits: 15
  },
  {
    icon: TrendingUp,
    prompt: "What's trending on social media about AI?",
    response: "📊 Using Grok for real-time social intelligence... Top trends: 1) GPT-4 Vision applications (↑45%), 2) Open-source LLMs (↑32%), 3) AI safety debates (↑28%). Sentiment: 78% positive. Best posting time: 2-4 PM EST.",
    badge: "Social Intel",
    credits: 10
  },
  {
    icon: Network,
    prompt: "Build a knowledge graph from my research notes",
    response: "🕸️ Creating semantic knowledge graph with vector embeddings... Identified 24 key concepts, 156 relationships, and 8 knowledge clusters. Visual graph ready with interactive exploration and intelligent search capabilities.",
    badge: "Knowledge",
    credits: 20
  },
  {
    icon: Brain,
    prompt: "Create a custom agent for customer support",
    response: "🤖 Launching Agent Studio... Your custom support agent can handle: FAQ responses, ticket routing, sentiment analysis, and escalation detection. Includes NLP training on your data and webhook integration for CRM systems.",
    badge: "Agent Builder",
    credits: 25
  },
];

export const EnhancedInteractiveDemo = () => {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<typeof DEMO_PROMPTS[0] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);

  const handlePromptClick = (prompt: typeof DEMO_PROMPTS[0]) => {
    setSelectedPrompt(null);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setSelectedPrompt(prompt);
      setTotalCredits(prev => prev + prompt.credits);
    }, 1500);
  };

  return (
    <Card className="w-full shadow-xl border-primary/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Interactive AI Demo</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            No Signup Required
          </Badge>
        </div>

        {/* Chat Display */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-4 bg-muted/30 rounded-lg p-4">
          {!selectedPrompt && !isTyping && (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 text-primary/50" />
              <p className="text-sm">Click any prompt below to see AI in action</p>
              <p className="text-xs mt-1">Try it without signing up!</p>
            </div>
          )}

          {selectedPrompt && !isTyping && (
            <>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-sm">{selectedPrompt.prompt}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg px-4 py-3 max-w-[85%] space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedPrompt.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedPrompt.credits} credits
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPrompt.response}</p>
                </div>
              </div>
            </>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border rounded-lg px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* Prompt Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {DEMO_PROMPTS.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3 px-3 flex items-start gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                onClick={() => handlePromptClick(prompt)}
              >
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-left line-clamp-2">{prompt.prompt}</span>
              </Button>
            );
          })}
        </div>

        {/* Credits & CTA */}
        <div className="pt-4 border-t space-y-3">
          {totalCredits > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Demo credits used:</span>
              <Badge variant="secondary">{totalCredits} credits</Badge>
            </div>
          )}
          <Button 
            className="w-full group" 
            size="lg"
            onClick={() => navigate("/chat")}
          >
            Try Full Platform Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Start with 500 free credits daily • No credit card required
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
