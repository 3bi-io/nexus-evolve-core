import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useHaptics, useMobile } from "@/hooks/useMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { navSections } from "@/config/navigation";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  showMenu = true 
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { light } = useHaptics();
  const { isOled } = useMobile();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleBack = () => {
    light();
    navigate(-1);
  };

  return (
    <header className={`sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b mobile-strong-border safe-top md:hidden ${isOled ? 'dark:oled:oled-card' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2.5 gap-2 min-h-[56px]">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="touch-active transition-transform h-10 w-10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-base font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <CreditBalance />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const html = document.documentElement;
              html.classList.toggle('dark');
            }}
            className="h-10 w-10 touch-active"
            aria-label="Toggle theme"
          >
            <span className="sr-only">Toggle theme</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path className="dark:hidden" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <path className="hidden dark:block" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </Button>
          
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-active transition-transform h-10 w-10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto bg-card border-border z-50">
                {navSections.map((section) => (
                  <div key={section.id}>
                    <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {section.items.map((item) => (
                      <DropdownMenuItem 
                        key={item.to}
                        onClick={() => navigate(item.to)}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
                
                {isAdmin && (
                  <>
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate("/admin")}
                      className="text-primary font-semibold"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
