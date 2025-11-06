import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { Brain, Sparkles, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface UnifiedHeaderProps {
  variant?: 'public' | 'app';
  transparent?: boolean;
  fixed?: boolean;
  className?: string;
}

export function UnifiedHeader({ 
  variant = 'public',
  transparent = false,
  fixed = true,
  className
}: UnifiedHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const baseClasses = cn(
    "z-40 w-full border-b",
    fixed ? "sticky top-0" : "",
    transparent 
      ? "bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50" 
      : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    className
  );

  // Public variant - for landing pages
  if (variant === 'public') {
    return (
      <header className={baseClasses}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative">
                <Brain className="w-7 h-7 text-primary" />
                <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="font-bold text-xl">Oneiros</span>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/getting-started" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/agent-marketplace" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              <a 
                href="https://docs.lovable.dev" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Docs
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  <Button 
                    onClick={() => navigate('/chat')}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    size="sm"
                    className="shadow-lg"
                  >
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // App variant - for authenticated pages with sidebar
  return (
    <header className={baseClasses}>
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
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="hidden sm:flex"
            >
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
  );
}
