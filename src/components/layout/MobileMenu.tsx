import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Download, HelpCircle } from "lucide-react";
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
import { useInstallStatus } from "@/hooks/useInstallStatus";

interface MobileMenuProps {
  authenticated?: boolean;
  onSignOut?: () => void;
  onNavigate?: (path: string) => void;
}

export function MobileMenu({ authenticated, onSignOut, onNavigate }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInstalled, canPrompt, triggerInstall } = useInstallStatus();

  const handleLinkClick = (path: string) => {
    setOpen(false);
    onNavigate?.(path);
  };

  const handleInstallClick = async () => {
    if (canPrompt) {
      setOpen(false);
      await triggerInstall();
    } else {
      handleLinkClick('/install');
    }
  };

  // Check if user is admin
  const isAdmin = false; // You can enhance this with actual admin check if needed

  // Show all sections to everyone (removed auth filtering)
  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Only filter admin-only items
        if (item.adminOnly && !isAdmin) return false;
        return true;
      })
    }))
    .filter(section => section.items.length > 0);

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
            {/* Install App Button - Show if not installed */}
            {!isInstalled && (
              <>
                <div className="px-2 mb-2">
                  <Button
                    onClick={handleInstallClick}
                    className="w-full gap-2 bg-primary hover:bg-primary/90 min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </Button>
                </div>
                <Separator className="my-2" />
              </>
            )}
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
            
            {/* Help Center - Available to all users */}
            <div className="px-2 mb-2">
              <Button
                onClick={() => {
                  setOpen(false);
                  // Trigger help widget by dispatching custom event
                  window.dispatchEvent(new CustomEvent('open-help-widget'));
                }}
                variant="outline"
                className="w-full min-h-[44px] gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Button>
            </div>
            
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
                  to="/"
                  onClick={() => handleLinkClick("/")}
                >
                  <Button className="w-full min-h-[44px] shadow-lg">
                    Start Using AI
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  onClick={() => handleLinkClick("/auth")}
                  className="text-center"
                >
                  <p className="text-xs text-muted-foreground py-2">
                    Optional: Create account to save preferences
                  </p>
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
