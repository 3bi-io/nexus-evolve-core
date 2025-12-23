import { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBottomNav?: boolean;
}

export function MobileLayout({
  children,
  title,
  showBack = false,
  showMenu = true,
  showBottomNav = true,
}: MobileLayoutProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader title={title} showBack={showBack} showMenu={showMenu} />
      
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          showBottomNav && "pb-20"
        )}
      >
        {children}
      </main>

      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
