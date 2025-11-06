import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { Brain, Sparkles } from "lucide-react";

interface HeaderProps {
  showSidebarTrigger?: boolean;
}

export function Header({ showSidebarTrigger = true }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-6 h-6 text-primary" />
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">Oneiros.me</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {user && <CreditBalance />}
          <ThemeToggle />
          
          {user ? (
            <Button onClick={handleSignOut} variant="outline" size="sm">
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
  );
}
