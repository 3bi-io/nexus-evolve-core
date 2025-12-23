import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useNavigate } from "react-router-dom";
import { DEMO_PROMPTS } from "@/data/demo-prompts";
import { motion } from "framer-motion";
import { SafeAnimatePresence } from "@/components/ui/SafeAnimatePresence";

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

  // Determine which state to show
  const showEmpty = !selectedPrompt && !isTyping;
  const showConversation = selectedPrompt && !isTyping;

  return (
    <Card className="w-full shadow-xl border-primary/20 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 -z-10" />
      
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-semibold">Interactive AI Demo</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            No Signup Required
          </Badge>
        </div>

        {/* Chat Display with animations */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-4 bg-muted/30 rounded-lg p-4">
          <SafeAnimatePresence mode="wait">
            {showEmpty && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center text-muted-foreground py-8"
              >
                <Brain className="w-12 h-12 mx-auto mb-3 text-primary/50 animate-pulse" />
                <p className="text-sm">Click any prompt below to see AI in action</p>
                <p className="text-xs mt-1">Try it without signing up!</p>
              </motion.div>
            )}

            {showConversation && (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div 
                  className="flex justify-end"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{selectedPrompt.prompt}</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex justify-start"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-background border rounded-lg px-4 py-3 max-w-[85%] space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedPrompt.badge}
                      </Badge>
                      <motion.span 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {selectedPrompt.credits} credits
                      </motion.span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPrompt.response}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {isTyping && (
              <motion.div 
                key="typing"
                className="flex justify-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-background border rounded-lg px-4 py-3">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </SafeAnimatePresence>
        </div>

        {/* Prompt Buttons - Responsive: 1 col on mobile, 2 cols on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_PROMPTS.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 px-3 flex items-start gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-left line-clamp-2">{prompt.prompt}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Credits & CTAs */}
        <div className="pt-4 border-t space-y-3">
          {totalCredits > 0 && (
            <SafeAnimatePresence>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">Demo credits used:</span>
                <motion.div
                  key={totalCredits}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Badge variant="secondary">{totalCredits} credits</Badge>
                </motion.div>
              </motion.div>
            </SafeAnimatePresence>
          )}
          
          <div className="space-y-2">
            <Button 
              className="w-full group" 
              size="lg"
              onClick={() => navigate("/chat")}
            >
              Experience the Full Platform
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              className="w-full group" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Start with 500 Free Credits Daily
              <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Real AI • All features unlocked • No credit card required
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
