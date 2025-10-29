import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.05 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverGlow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ boxShadow: "0 0 20px rgba(var(--primary-rgb), 0.5)" }}
      transition={{ duration: 0.2 }}
      className={cn("rounded-lg", className)}
    >
      {children}
    </motion.div>
  );
}

export function PressEffect({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FloatingElement({ 
  children, 
  className,
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
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
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RotateOnHover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ShakeOnError({ 
  children, 
  className,
  trigger 
}: { 
  children: ReactNode; 
  className?: string;
  trigger: boolean;
}) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PulseEffect({ children, className }: { children: ReactNode; className?: string }) {
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
      className={className}
    >
      {children}
    </motion.div>
  );
}
