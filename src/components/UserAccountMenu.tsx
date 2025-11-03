import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  CreditCard,
  Trophy,
  Gift,
  BarChart3,
  Bot,
  Key,
  LogOut,
} from "lucide-react";

export function UserAccountMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const userInitial = user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline text-sm">{user.email?.split('@')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">My Account</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile & Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/pricing" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing & Plans</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          My Activity
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/achievements" className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Achievements</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/referrals" className="cursor-pointer">
            <Gift className="mr-2 h-4 w-4" />
            <span>Referrals</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/analytics" className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>My Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/agent-studio" className="cursor-pointer">
            <Bot className="mr-2 h-4 w-4" />
            <span>My Agents</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/api-access" className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
