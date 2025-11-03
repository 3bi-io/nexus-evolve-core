import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, Network, Brain, LogOut, Shield, BarChart3, 
  Keyboard, Store, Phone, Layers, Activity, Settings, GitBranch, 
  Sparkles, Plug, Cpu, Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Header() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasIssues, criticalIssues } = useSecretValidation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: "/chat", icon: MessageSquare, label: "Chat", public: true },
    { to: "/knowledge-graph", icon: Network, label: "Knowledge", public: false },
    { to: "/memory-graph", icon: GitBranch, label: "Memory", public: false },
    { to: "/problem-solver", icon: Brain, label: "Solver", public: false },
    { to: "/analytics", icon: BarChart3, label: "Analytics", public: false },
    { to: "/agi-dashboard", icon: Sparkles, label: "AGI Dashboard", public: false },
    { to: "/agent-marketplace", icon: Store, label: "Market", public: false },
    { to: "/voice-agent", icon: Phone, label: "Voice AI", public: false },
    { to: "/ai-hub", icon: Layers, label: "AI Hub", public: false },
    { to: "/advanced-browser-ai", icon: Sparkles, label: "Phase 3B", public: false },
    { to: "/router-dashboard", icon: Activity, label: "Router", public: false },
    { to: "/enterprise-router", icon: Settings, label: "Enterprise", public: false },
    { to: "/integrations", icon: Plug, label: "Phase 2", public: false },
    { to: "/advanced-ai", icon: Cpu, label: "Phase 3", public: false },
    { to: "/system-health", icon: Shield, label: "Health", public: false, badge: hasIssues ? (criticalIssues || '!') : null },
  ];

  const visibleLinks = user ? navLinks : navLinks.filter(link => link.public);

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 safe-top">
      <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">Oneiros.me</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {visibleLinks.map((link) => (
              <Link key={link.to} to={link.to} className="flex-shrink-0">
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 relative"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{link.label}</span>
                  {link.badge && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 h-4 text-xs min-w-4">
                      {link.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex-shrink-0">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden xl:inline">Admin</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts'))}
                    className="hidden lg:flex"
                  >
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts (Ctrl+/)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <CreditBalance />
            <ThemeToggle />
            
            {user ? (
              <Button onClick={signOut} variant="ghost" size="sm" className="gap-2 hidden sm:flex">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2 touch-feedback">
                  <span className="hidden sm:inline">Sign Up Free</span>
                  <span className="sm:hidden">Sign Up</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                  <div className="flex flex-col space-mobile">
                    {visibleLinks.map((link) => (
                      <Link 
                        key={link.to} 
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive(link.to) ? "default" : "ghost"}
                          className="w-full justify-start gap-3 relative touch-feedback"
                        >
                          <link.icon className="w-5 h-5" />
                          <span>{link.label}</span>
                          {link.badge && (
                            <Badge variant="destructive" className="ml-auto">
                              {link.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive("/admin") ? "default" : "ghost"}
                          className="w-full justify-start gap-3 touch-feedback"
                        >
                          <Shield className="w-5 h-5" />
                          <span>Admin</span>
                        </Button>
                      </Link>
                    )}
                    {user && (
                      <>
                        <div className="border-t border-border my-4" />
                        <Button 
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }} 
                          variant="ghost" 
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 touch-feedback"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </Button>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
