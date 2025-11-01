import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MicroInteractionProps {
  children: ReactNode;
}

export function HoverScale({ children, scale = 1.05 }: MicroInteractionProps & { scale?: number }) {
  return (
    <motion.div whileHover={{ scale }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  );
}

export function HoverLift({ children }: MicroInteractionProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function HoverGlow({ children }: MicroInteractionProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: "0 0 20px rgba(var(--primary), 0.5)",
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function PressEffect({ children }: MicroInteractionProps) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
      {children}
    </motion.div>
  );
}

export function FloatingElement({ children, delay = 0 }: MicroInteractionProps & { delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function RotateOnHover({ children }: MicroInteractionProps) {
  return (
    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

export function ShakeOnError({ children, trigger }: MicroInteractionProps & { trigger: boolean }) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export function PulseEffect({ children }: MicroInteractionProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
