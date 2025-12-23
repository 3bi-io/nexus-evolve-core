import { ReactNode } from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const ResponsiveChatLayout = ({ sidebar, children }: ResponsiveChatLayoutProps) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Mobile: Full width, sidebar as drawer
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] w-full">
        {children}
      </div>
    );
  }

  // Desktop/Tablet: Side-by-side layout
  return (
    <div className="flex h-[calc(100vh-57px)] w-full">
      {sidebar}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
