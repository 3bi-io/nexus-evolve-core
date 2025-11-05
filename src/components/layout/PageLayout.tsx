import { ReactNode, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/page-transition";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
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

function DesktopLayout({
  children,
  showHeader,
  showFooter,
  className,
}: {
  children: ReactNode;
  showHeader: boolean;
  showFooter: boolean;
  className: string;
}) {
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+B (Mac) or Ctrl+B (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="flex flex-col flex-1 min-w-0">
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <DesktopLayout 
          showHeader={showHeader}
          showFooter={showFooter}
          className={className}
        >
          {children}
        </DesktopLayout>
      </div>
    </SidebarProvider>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
