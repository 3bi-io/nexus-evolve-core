import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/ui/page-transition";

interface PageLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
  transition?: boolean;
}

export function PageLayout({ 
  children, 
  showNavigation = true, 
  className = "",
  transition = true 
}: PageLayoutProps) {
  const content = (
    <div className={`min-h-screen bg-background ${className}`}>
      {showNavigation && <Navigation />}
      <main>{children}</main>
    </div>
  );

  return transition ? <PageTransition>{content}</PageTransition> : content;
}
