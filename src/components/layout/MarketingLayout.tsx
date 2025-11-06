import { ReactNode } from "react";
import { UnifiedHeader } from "./UnifiedHeader";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface MarketingLayoutProps {
  children: ReactNode;
  transparent?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function MarketingLayout({
  children,
  transparent = false,
  showFooter = true,
  className,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UnifiedHeader variant="public" transparent={transparent} />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
