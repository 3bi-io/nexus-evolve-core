import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  className?: string;
}

export function AuthLayout({ children, showBack = true, className }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header with back button and theme toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-safe-top">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          ) : (
            <div />
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main content - centered */}
      <main 
        id="main-content"
        className={cn(
          "flex-1 flex items-center justify-center px-4 py-20",
          className
        )}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground pb-safe-bottom">
        <p>© 2025 Oneiros. All rights reserved.</p>
      </footer>
    </div>
  );
}
