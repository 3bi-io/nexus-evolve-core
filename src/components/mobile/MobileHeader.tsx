import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useHaptics } from "@/hooks/useMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signOut } = useAuth();
  const { light } = useHaptics();

  const handleBack = () => {
    light();
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b mobile-strong-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="touch-active transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CreditBalance />
          <ThemeToggle />
          
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-active transition-transform"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/achievements")}>
                  Achievements
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/evolution")}>
                  Evolution
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/capabilities")}>
                  Capabilities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/pricing")}>
                  Pricing
                </DropdownMenuItem>
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
