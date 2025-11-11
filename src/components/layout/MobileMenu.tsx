import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { navSections } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  authenticated?: boolean;
  onSignOut?: () => void;
  onNavigate?: (path: string) => void;
}

export function MobileMenu({ authenticated, onSignOut, onNavigate }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const handleLinkClick = (path: string) => {
    setOpen(false);
    onNavigate?.(path);
  };

  // Check if user is admin
  const isAdmin = false; // You can enhance this with actual admin check if needed

  // Filter sections based on authentication and admin status
  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Filter admin-only items
        if (item.adminOnly && !isAdmin) return false;
        // Filter auth-required items for non-authenticated users
        if (!item.public && !authenticated) return false;
        return true;
      })
    }))
    .filter(section => section.items.length > 0); // Remove empty sections

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 touch-active"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[340px]">
        <SheetHeader className="mb-4">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <nav className="flex flex-col gap-1">
            {filteredSections.map((section, sectionIdx) => (
              <div key={section.id}>
                {sectionIdx > 0 && <Separator className="my-3" />}
                
                <div className="px-2 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section.label}
                  </h3>
                  
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => handleLinkClick(item.to)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5",
                            "text-sm font-medium transition-colors touch-active",
                            "min-h-[44px]", // Touch target
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            <Separator className="my-3" />
            
            {authenticated ? (
              <div className="px-2 space-y-2">
                <Link
                  to="/account"
                  onClick={() => handleLinkClick("/account")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-sm font-medium transition-colors touch-active",
                    "min-h-[44px]",
                    location.pathname === "/account"
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  Account Settings
                </Link>
                <Button
                  onClick={() => {
                    setOpen(false);
                    onSignOut?.();
                  }}
                  variant="outline"
                  className="w-full min-h-[44px]"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link
                  to="/auth"
                  onClick={() => handleLinkClick("/auth")}
                >
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  onClick={() => handleLinkClick("/auth")}
                >
                  <Button className="w-full min-h-[44px] shadow-lg">
                    Start Free
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
