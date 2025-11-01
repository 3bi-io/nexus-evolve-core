import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface SparkleEffectProps {
  children: ReactNode;
  trigger?: "hover" | "always";
  className?: string;
}

export function SparkleEffect({ children, trigger = "hover", className }: SparkleEffectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldSparkle = trigger === "always" || isHovered;

  const sparkles = Array.from({ length: 3 });

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {shouldSparkle &&
        sparkles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
            className="absolute top-1/2 left-1/2 h-1 w-1 rounded-full bg-primary"
            style={{
              boxShadow: "0 0 10px 2px hsl(var(--primary) / 0.5)",
            }}
          />
        ))}
    </div>
  );
}

export function ShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-block bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlowText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.span
      animate={{
        textShadow: [
          "0 0 10px hsl(var(--primary) / 0.5)",
          "0 0 20px hsl(var(--primary) / 0.8)",
          "0 0 10px hsl(var(--primary) / 0.5)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn("text-primary font-semibold", className)}
    >
      {children}
    </motion.span>
  );
}
