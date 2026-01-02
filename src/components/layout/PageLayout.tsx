import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/page-transition";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { MobileBreadcrumb } from "@/components/mobile/MobileBreadcrumb";
import { UnifiedHeader } from "./UnifiedHeader";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

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

function MainLayout({
  children,
  showHeader,
  showFooter,
  showBottomNav,
  className,
  user,
  signOut,
  navigate,
}: {
  children: ReactNode;
  showHeader: boolean;
  showFooter: boolean;
  showBottomNav: boolean;
  className: string;
  user: any;
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
}) {
  const sidebar = useSidebar();
  const { toggleSidebar, setOpenMobile, isMobile: sidebarIsMobile } = sidebar || { 
    toggleSidebar: () => {}, 
    setOpenMobile: () => {}, 
    isMobile: false 
  };
  const { isMobile, isSmallMobile, isTouchDevice, orientation } = useResponsive();

  // Add swipe gestures for mobile - swipe from left edge to open (only if sidebar exists)
  useSwipeGestures({
    onSwipeRight: () => {
      if (sidebarIsMobile && sidebar) {
        setOpenMobile(true);
      }
    },
    threshold: 80,
    edgeSwipe: true,
    edgeThreshold: 30,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      {showHeader && <UnifiedHeader variant="app" />}
      
      {/* Mobile Breadcrumb - Sticky at top of content */}
      {isMobile && <MobileBreadcrumb />}
      
      <main 
        className={cn(
          'flex-1',
          // Mobile-first responsive padding
          'px-3 sm:px-4 lg:px-6',
          // Adjust for bottom nav on mobile
          isMobile && showBottomNav && 'pb-20',
          // Reduce padding on small mobile devices
          isSmallMobile && 'px-2',
          // Adjust for orientation
          orientation === 'landscape' && isMobile && 'py-2',
          className
        )}
        style={{
          // Prevent zoom on double-tap for touch devices
          touchAction: isTouchDevice ? 'manipulation' : 'auto',
        }}
      >
        <div className={cn(
          'mx-auto',
          'pt-3 sm:pt-4 lg:pt-6',
          // Container width - mobile-first
          'w-full',
          !isSmallMobile && 'max-w-7xl',
        )}>
          {/* Desktop Breadcrumb */}
          {!isMobile && <BreadcrumbNav />}
        </div>
        {children}
      </main>
      {isMobile && showBottomNav && <MobileBottomNav />}
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Always wrap in SidebarProvider so useSidebar hook works everywhere
  // But only render AppSidebar on desktop/tablet
  const content = (
    <SidebarProvider defaultOpen={true}>
      <div 
        className={cn(
          'flex min-h-screen w-full',
          'bg-background',
          'antialiased',
        )}
      >
        {/* Only show sidebar on desktop/tablet */}
        {!isMobile && <AppSidebar />}
        
        <MainLayout 
          showHeader={showHeader}
          showFooter={showFooter}
          showBottomNav={showBottomNav}
          className={className}
          user={user}
          signOut={signOut}
          navigate={navigate}
        >
          {children}
        </MainLayout>
      </div>
    </SidebarProvider>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
