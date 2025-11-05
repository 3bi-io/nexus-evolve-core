import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { primaryNavItems, navSections } from "@/config/navigation";

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const visiblePrimaryLinks = user 
    ? primaryNavItems 
    : primaryNavItems.filter(item => item.public);

  // Get all nav items for mobile menu
  const allNavItems = navSections.flatMap(section => section.items);

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 safe-top">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-primary flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg hidden xs:inline truncate">Oneiros</span>
          </Link>

          {/* Desktop/Tablet Navigation - Primary Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center min-w-0">
            {visiblePrimaryLinks.map((link) => (
              <Link key={link.to} to={link.to} className="flex-shrink-0">
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 h-9 px-3",
                    "hover:bg-accent hover:text-accent-foreground transition-colors"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                  <span className="lg:hidden">{link.label.slice(0, 1)}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {user && <CreditBalance />}
            <ThemeToggle />
            
            {user ? (
              <Button 
                onClick={signOut} 
                variant="ghost" 
                size="sm" 
                className="gap-2 hidden sm:flex h-9 px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="default" 
                  size="sm" 
                  className={cn(
                    "gap-1.5 h-9 px-3 sm:px-4",
                    "min-h-[44px] sm:min-h-0", // Touch target for mobile
                    "hover:shadow-lg transition-shadow"
                  )}
                >
                  <span className="text-sm sm:text-base font-semibold">Start Free</span>
                </Button>
              </Link>
            )}

            {/* Mobile/Tablet Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "md:hidden h-9 w-9 p-0",
                    "min-h-[44px] min-w-[44px]" // Touch target
                  )}
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] sm:w-[320px] bg-background/98 backdrop-blur-sm"
              >
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
                  <div className="flex flex-col gap-1.5">
                    {navSections.map((section) => (
                      <div key={section.id}>
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-3 mt-3 first:mt-0">
                          {section.label}
                        </div>
                        {section.items.map((item) => (
                          <Link 
                            key={item.to} 
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={isActive(item.to) ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 h-11 px-3",
                                "relative touch-feedback"
                              )}
                            >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <Badge variant="destructive" className="ml-auto text-xs px-1.5">
                                  {item.badge}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    ))}
                    
                    {isAdmin && (
                      <>
                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 px-3">
                          Admin
                        </div>
                        <Link 
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={location.pathname.startsWith("/admin") ? "default" : "ghost"}
                            className="w-full justify-start gap-3 h-11 px-3 touch-feedback"
                          >
                            <Brain className="w-5 h-5" />
                            <span>Admin Panel</span>
                          </Button>
                        </Link>
                      </>
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
                          className={cn(
                            "w-full justify-start gap-3 h-11 px-3",
                            "text-destructive hover:text-destructive hover:bg-destructive/10",
                            "touch-feedback"
                          )}
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
