import { motion } from "framer-motion";
import { Sparkles, Brain, Wand2, Image, MessageSquare, Mic } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";

interface WelcomeHeroProps {
  onPromptSelect: (prompt: string) => void;
}

const capabilities = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Ask anything",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Image,
    title: "Generate",
    description: "Create images",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: Brain,
    title: "Analyze",
    description: "Deep insights",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Mic,
    title: "Voice",
    description: "Speak naturally",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
];

const examplePrompts = [
  { text: "Generate a futuristic city", icon: Image },
  { text: "Explain quantum computing", icon: Brain },
  { text: "Help me write a story", icon: Wand2 },
  { text: "Analyze an image", icon: Sparkles },
];

export function WelcomeHero({ onPromptSelect }: WelcomeHeroProps) {
  const { isMobile } = useResponsive();

  // Mobile: show only 2 prompts to prevent cutoff
  const visiblePrompts = isMobile ? examplePrompts.slice(0, 2) : examplePrompts;

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-3 md:py-12 max-w-3xl mx-auto scrollbar-hide overflow-y-auto">
      {/* Animated Logo/Brand - more compact on mobile */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mb-3 md:mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-2xl rounded-full" />
        <div className="relative flex items-center gap-3">
          <div className="p-2.5 md:p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <Sparkles className="w-6 h-6 md:w-10 md:h-10 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Welcome Text - condensed on mobile */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-center mb-4 md:mb-8"
      >
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text mb-1">
          Welcome to Oneiros
        </h1>
        <p className="text-muted-foreground text-xs md:text-base max-w-md mx-auto">
          Your AI companion for creation & discovery
        </p>
      </motion.div>

      {/* Capability Cards - tighter on mobile */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-4 gap-1.5 md:gap-3 w-full mb-4 md:mb-8"
      >
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.03, duration: 0.25 }}
            className={`
              relative p-2 md:p-4 rounded-lg md:rounded-xl border border-border/50
              bg-gradient-to-br ${cap.color}
              transition-all duration-200 cursor-default
            `}
          >
            <cap.icon className={`w-4 h-4 md:w-6 md:h-6 ${cap.iconColor} mb-0.5 md:mb-2`} />
            <p className="font-medium text-[10px] md:text-base leading-tight">{cap.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Prompts - fewer on mobile */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="w-full"
      >
        <p className="text-[10px] md:text-sm text-muted-foreground text-center mb-2 md:mb-3">
          Try one of these
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          {visiblePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ x: index % 2 === 0 ? -15 : 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.04, duration: 0.25 }}
              onClick={() => onPromptSelect(prompt.text)}
              className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg md:rounded-xl border border-border/50 
                bg-card/50 hover:bg-accent/50 hover:border-primary/30
                text-left transition-all duration-150 group
                active:scale-[0.97] touch-manipulation"
            >
              <div className="p-1.5 md:p-2 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors shrink-0">
                <prompt.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs md:text-base text-foreground/80 group-hover:text-foreground">
                {prompt.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
