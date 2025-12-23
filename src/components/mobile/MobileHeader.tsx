import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Brain, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useHaptics, useResponsive } from "@/hooks/useResponsive";
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
import { useTheme } from "next-themes";

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
  const { isOled } = useResponsive();
  const { theme, setTheme } = useTheme();
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
              light();
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className="h-10 w-10 touch-active"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
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
