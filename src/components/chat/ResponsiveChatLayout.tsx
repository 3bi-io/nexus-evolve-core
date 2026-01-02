import { ReactNode } from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const ResponsiveChatLayout = ({ sidebar, children }: ResponsiveChatLayoutProps) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Mobile: Account for bottom nav (72px) and use dvh for keyboard handling
    return (
      <div className="flex flex-col h-[calc(100dvh-72px)] w-full">
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
