import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

const DEMO_PROMPTS = [
  {
    icon: Brain,
    prompt: "How can you help me solve complex problems?",
    response: "I use advanced reasoning to break down complex problems into clear steps. I can analyze situations from multiple angles, identify patterns, and suggest evidence-based solutions. Try asking me about a challenge you're facing!"
  },
  {
    icon: Sparkles,
    prompt: "What makes you different from other AI?",
    response: "I learn from our conversations! Every interaction helps me understand you better. I can extract insights, build a knowledge graph of what matters to you, and get smarter over time. Plus, you can track my evolution on the dashboard."
  },
  {
    icon: TrendingUp,
    prompt: "How does the learning system work?",
    response: "After meaningful conversations, you can click 'Extract Learnings' to save insights. I analyze patterns, key concepts, and solutions. These get stored in your personal knowledge graph, making future responses more relevant to you."
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
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Try it now - no signup required</h3>
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
