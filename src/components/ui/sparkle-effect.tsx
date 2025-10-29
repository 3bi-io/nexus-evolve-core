import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface SparkleEffectProps {
  children: ReactNode;
  className?: string;
  trigger?: "hover" | "always";
}

export function SparkleEffect({ children, className, trigger = "hover" }: SparkleEffectProps) {
  const [isActive, setIsActive] = useState(trigger === "always");

  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (360 / 8) * i,
    delay: i * 0.1,
  }));

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => trigger === "hover" && setIsActive(true)}
      onMouseLeave={() => trigger === "hover" && setIsActive(false)}
    >
      {children}
      
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((sparkle.angle * Math.PI) / 180) * 30,
                y: Math.sin((sparkle.angle * Math.PI) / 180) * 30,
              }}
              transition={{
                duration: 1,
                delay: sparkle.delay,
                repeat: trigger === "always" ? Infinity : 0,
                repeatDelay: 2,
              }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-block bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent",
        "bg-[length:200%_auto] animate-shimmer",
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlowText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 blur-xl opacity-50 animate-pulse-glow"
        style={{ color: "hsl(var(--primary))" }}
      >
        {children}
      </span>
    </span>
  );
}
