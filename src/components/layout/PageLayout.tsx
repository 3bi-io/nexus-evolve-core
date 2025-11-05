import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/page-transition";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useMobile } from "@/hooks/useMobile";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  transition?: boolean;
  title?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

export function PageLayout({ 
  children, 
  showHeader = true,
  showFooter = true,
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
      <div className={className}>
        <BreadcrumbNav />
        {children}
      </div>
      {showFooter && <Footer />}
    </MobileLayout>
  ) : (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 ${className}`}>
        <div className="container mx-auto px-4 pt-4">
          <BreadcrumbNav />
        </div>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
