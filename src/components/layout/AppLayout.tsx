import { ReactNode } from "react";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { UnifiedHeader } from "./UnifiedHeader";
import { Footer } from "./Footer";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showBottomNav?: boolean;
  className?: string;
  title?: string;
}

export function AppLayout({
  children,
  showFooter = false,
  showBottomNav = true,
  className,
  title,
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  usePageAnalytics(title);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <AppSidebar />}
        
        <div className="flex-1 flex flex-col w-full">
          <UnifiedHeader variant="app" />
          
          <main 
            id="main-content"
            className={cn(
              "flex-1 w-full",
              "pb-safe-bottom",
              showBottomNav && isMobile && "pb-20",
              className
            )}
          >
            {children}
          </main>
          
          {showFooter && <Footer />}
          {showBottomNav && isMobile && <MobileBottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
