import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useMobile } from "@/hooks/useMobile";

interface PageLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
  transition?: boolean;
  title?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

export function PageLayout({ 
  children, 
  showNavigation = true, 
  className = "",
  transition = true,
  title,
  showBack = false,
  showBottomNav = true,
}: PageLayoutProps) {
  const { isMobile } = useMobile();

  const content = isMobile ? (
    <MobileLayout 
      title={title} 
      showBack={showBack} 
      showBottomNav={showBottomNav}
    >
      <div className={`safe-top ${className}`}>
        {children}
      </div>
    </MobileLayout>
  ) : (
    <div className={`min-h-screen bg-background ${className}`}>
      {showNavigation && <Navigation />}
      <main className="pt-16">{children}</main>
    </div>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
