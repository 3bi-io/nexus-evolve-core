import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  message?: string;
  className?: string;
}

export function SuccessAnimation({ message, className }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center gap-4", className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Check className="w-10 h-10 text-success" strokeWidth={3} />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 rounded-full border-4 border-success"
        />
      </motion.div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-medium text-success"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

export function CelebrationAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "linear",
          }}
          className="absolute"
        >
          <Sparkles
            className="text-primary"
            size={16 + Math.random() * 16}
            style={{ opacity: 0.7 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function ConfettiAnimation() {
  const colors = [
    "bg-primary",
    "bg-success",
    "bg-warning",
    "bg-destructive",
    "bg-accent",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720,
            x: Math.random() * window.innerWidth * 0.2 - window.innerWidth * 0.1,
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            delay: Math.random() * 0.3,
            ease: "easeIn",
          }}
          className={cn(
            "absolute w-3 h-3 rounded",
            colors[Math.floor(Math.random() * colors.length)]
          )}
        />
      ))}
    </div>
  );
}
