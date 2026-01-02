import { ReactNode } from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const ResponsiveChatLayout = ({ sidebar, children }: ResponsiveChatLayoutProps) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Mobile: Full screen chat, optimized for touch
    // Using dvh (dynamic viewport height) to handle mobile keyboard correctly
    return (
      <div className="flex flex-col h-[100dvh] w-full safe-bottom">
        {children}
      </div>
    );
  }

  // Desktop/Tablet: Side-by-side layout with proper height calculation
  return (
    <div className="flex h-[calc(100dvh-57px)] w-full">
      {sidebar}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};
