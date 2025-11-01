import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ message, onComplete }: SuccessAnimationProps) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="h-8 w-8 text-success" />
        </div>
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-success"
        />
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium text-foreground"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

export function ConfettiAnimation() {
  const confetti = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: "50vw",
            y: "50vh",
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1 + Math.random(),
            ease: "easeOut",
          }}
          className="absolute h-3 w-3 rounded"
          style={{
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
        />
      ))}
    </div>
  );
}

export function CelebrationAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: i * 45 }}
          animate={{
            scale: [0, 1, 0],
            y: [0, -100],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: "easeOut",
          }}
          className="absolute h-2 w-2 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}
