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
  { text: "Generate a futuristic city at sunset", icon: Image },
  { text: "Explain quantum computing simply", icon: Brain },
  { text: "Help me write a creative story", icon: Wand2 },
  { text: "Analyze this image for me", icon: Sparkles },
];

export function WelcomeHero({ onPromptSelect }: WelcomeHeroProps) {
  const { isMobile, isTablet } = useResponsive();
  const isCompact = isMobile || isTablet;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 md:py-12 max-w-3xl mx-auto">
      {/* Animated Logo/Brand */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6 md:mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl rounded-full animate-pulse" />
        <div className="relative flex items-center gap-3">
          <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center mb-6 md:mb-8"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text mb-2">
          Welcome to Oneiros
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Your AI companion for creation, exploration, and discovery
        </p>
      </motion.div>

      {/* Capability Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full mb-6 md:mb-8"
      >
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            className={`
              relative p-3 md:p-4 rounded-xl border border-border/50
              bg-gradient-to-br ${cap.color}
              hover:border-primary/30 transition-all duration-300
              cursor-default group
            `}
          >
            <cap.icon className={`w-5 h-5 md:w-6 md:h-6 ${cap.iconColor} mb-1 md:mb-2 group-hover:scale-110 transition-transform`} />
            <p className="font-medium text-sm md:text-base">{cap.title}</p>
            <p className="text-xs text-muted-foreground hidden md:block">{cap.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Prompts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full"
      >
        <p className="text-xs md:text-sm text-muted-foreground text-center mb-3">
          Try one of these to get started
        </p>
        <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {examplePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
              onClick={() => onPromptSelect(prompt.text)}
              className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-border/50 
                bg-card/50 hover:bg-accent/50 hover:border-primary/30
                text-left transition-all duration-200 group
                active:scale-[0.98] touch-manipulation"
            >
              <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                <prompt.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm md:text-base text-foreground/80 group-hover:text-foreground line-clamp-2">
                {prompt.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
