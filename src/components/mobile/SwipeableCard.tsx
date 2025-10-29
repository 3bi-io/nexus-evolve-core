import { ReactNode, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  threshold = 100,
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= threshold) {
      if (offset > 0 && onSwipeRight) {
        setExitX(1000);
        controls.start({ x: 1000, opacity: 0 });
        setTimeout(onSwipeRight, 200);
      } else if (offset < 0 && onSwipeLeft) {
        setExitX(-1000);
        controls.start({ x: -1000, opacity: 0 });
        setTimeout(onSwipeLeft, 200);
      } else {
        controls.start({ x: 0, opacity: 1 });
      }
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={cn("cursor-grab active:cursor-grabbing", className)}
    >
      {children}
    </motion.div>
  );
}
