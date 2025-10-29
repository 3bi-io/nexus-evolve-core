import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, TrendingUp, Phone, Store, Globe } from 'lucide-react';

const DEMO_PROMPTS = [
  {
    icon: Phone,
    prompt: "Can I have a voice conversation with you?",
    response: "Absolutely! Our Voice AI feature powered by ElevenLabs lets you have natural conversations with me. Just head to the Voice AI section and start chatting with your voice—I can even invoke tools like generating images or checking trends!"
  },
  {
    icon: Store,
    prompt: "What's the Agent Marketplace?",
    response: "The Agent Marketplace lets you create custom AI agents with specific personalities, knowledge, and capabilities. You can share them with the community, use others' agents, and even monetize your creations. It's like an app store for AI!"
  },
  {
    icon: Brain,
    prompt: "How do your multiple agents work together?",
    response: "I use 5 specialized agents: a Coordinator (routes tasks), Reasoning Agent (deep analysis), Creative Agent (innovative solutions), Learning Agent (extracts insights), and Grok Reality Agent (real-time trends). They collaborate to give you the best possible response!"
  },
  {
    icon: Globe,
    prompt: "What can you tell me about trending topics?",
    response: "With Social Intelligence, I can analyze real-time trends, track sentiment, and help you create viral content. I integrate with Grok to fetch the latest trending topics across social platforms and provide insights on what's capturing attention!"
  },
  {
    icon: Sparkles,
    prompt: "How do you learn and improve over time?",
    response: "I have an autonomous evolution system! After conversations, I extract learnings and build your personal knowledge graph. Every night, I analyze performance, discover new capabilities, and optimize my responses. I literally get smarter while you sleep!"
  },
  {
    icon: TrendingUp,
    prompt: "What makes you different from ChatGPT?",
    response: "Unlike single-model AI, I'm a complete ecosystem: multi-agent orchestration, voice conversations, agent marketplace, social intelligence, multimodal capabilities, gamification, and self-learning evolution. It's 9 integrated systems vs. just a chatbot!"
  }
];

export function InteractiveDemo() {
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handlePromptClick = (index: number) => {
    setIsTyping(true);
    setSelectedPrompt(null);
    setTimeout(() => {
      setIsTyping(false);
      setSelectedPrompt(index);
    }, 1200);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary animate-pulse-glow" />
          <h3 className="font-semibold">Try the most advanced AI - no signup required</h3>
        </div>

        {/* Demo Chat Area */}
        <div className="space-y-4 min-h-[200px]">
          {/* User Message */}
          {selectedPrompt !== null && (
            <div className="flex justify-end animate-fade-in">
              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                {DEMO_PROMPTS[selectedPrompt].prompt}
              </div>
            </div>
          )}

          {/* AI Response */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {selectedPrompt !== null && !isTyping && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%]">
                <p className="text-sm">{DEMO_PROMPTS[selectedPrompt].response}</p>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Click a question to see how I respond:</p>
          {DEMO_PROMPTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="justify-start gap-3 h-auto py-3 text-left"
                onClick={() => handlePromptClick(index)}
                disabled={isTyping}
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{item.prompt}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
