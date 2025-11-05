import { ReactNode, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/page-transition";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/useMobile";
import { useAuth } from "@/contexts/AuthContext";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain } from "lucide-react";

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
  user,
  signOut,
  navigate,
}: {
  children: ReactNode;
  showHeader: boolean;
  showFooter: boolean;
  className: string;
  user: any;
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
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
      {showHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg hidden sm:inline-block">Oneiros</span>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {user && <CreditBalance />}
              <ThemeToggle />
              {user ? (
                <Button onClick={async () => { await signOut(); navigate("/"); }} variant="outline" size="sm">
                  Sign Out
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Start Free</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      )}
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
