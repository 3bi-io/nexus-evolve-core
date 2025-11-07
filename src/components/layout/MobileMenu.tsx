import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  authenticated?: boolean;
  onSignOut?: () => void;
  onNavigate?: (path: string) => void;
}

export function MobileMenu({ authenticated, onSignOut, onNavigate }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const handleLinkClick = (path: string) => {
    setOpen(false);
    onNavigate?.(path);
  };

  const navLinks = [
    { to: "/getting-started", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/agent-marketplace", label: "Marketplace" },
    { to: "/capabilities", label: "Docs" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 touch-active"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleLinkClick(link.to)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium",
                "hover:bg-accent transition-colors touch-active",
                "min-h-[48px]" // Touch target
              )}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="border-t my-4" />
          
          {authenticated ? (
            <>
              <Link
                to="/chat"
                onClick={() => handleLinkClick("/chat")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium",
                  "hover:bg-accent transition-colors touch-active min-h-[48px]"
                )}
              >
                Dashboard
              </Link>
              <Button
                onClick={() => {
                  setOpen(false);
                  onSignOut?.();
                }}
                variant="outline"
                className="w-full min-h-[48px]"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                onClick={() => handleLinkClick("/auth")}
              >
                <Button variant="outline" className="w-full min-h-[48px]">
                  Sign In
                </Button>
              </Link>
              <Link
                to="/auth"
                onClick={() => handleLinkClick("/auth")}
              >
                <Button className="w-full min-h-[48px] shadow-lg">
                  Start Free
                </Button>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
