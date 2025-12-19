import { ReactNode, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useHaptics } from "@/hooks/useResponsive";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
}: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();
  const { medium } = useHaptics();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY !== 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      medium();
      controls.start({ rotate: 360 });

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        controls.start({ rotate: 0 });
      }
    } else {
      setPullDistance(0);
    }
  };

  const refreshScale = Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: pullDistance }}
        animate={{ opacity: refreshScale }}
      >
        <motion.div
          animate={controls}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-primary"
        >
          <RefreshCw className="w-6 h-6" />
          <span className="text-sm font-medium">
            {isRefreshing ? "Refreshing..." : pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: isRefreshing ? threshold : Math.min(pullDistance, threshold) }}
        transition={{ type: "spring", damping: 15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
