import { ReactNode, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/page-transition";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/useMobile";
import { useAuth } from "@/contexts/AuthContext";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { Brain, Sparkles } from "lucide-react";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

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
  const { toggleSidebar, setOpenMobile, isMobile } = useSidebar();

  // Add swipe gestures for mobile - swipe from left edge to open
  useSwipeGestures({
    onSwipeRight: () => {
      if (isMobile) {
        setOpenMobile(true);
      }
    },
    threshold: 80,
    edgeSwipe: true, // Only trigger from screen edges
    edgeThreshold: 30, // 30px from edge
  });

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
      {showHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2">
                <div className="relative">
                  <Brain className="w-6 h-6 text-primary" />
                  <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="font-bold text-lg hidden sm:inline-block">Oneiros.me</span>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {user && <CreditBalance />}
              <ThemeToggle />
              {user ? (
                <Button onClick={async () => { await signOut(); navigate("/"); }} variant="outline" size="sm" className="hidden sm:flex">
                  Sign Out
                </Button>
              ) : (
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link to="/auth">Start Free</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      )}
      <main className={`flex-1 ${className} ${isMobile && showBottomNav ? 'pb-16' : ''}`}>
        <div className="container mx-auto px-4 pt-4">
          <BreadcrumbNav />
        </div>
        {children}
      </main>
      {isMobile && showBottomNav && <MobileBottomNav />}
      {showFooter && !isMobile && <Footer />}
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

  const content = (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <MainLayout 
          showHeader={showHeader}
          showFooter={showFooter}
          showBottomNav={showBottomNav}
          className={className}
          user={user}
          signOut={signOut}
          navigate={navigate}
          children={children}
        />
      </div>
    </SidebarProvider>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
