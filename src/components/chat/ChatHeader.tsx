import { Brain, LogOut, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { AgentSelector } from "@/components/AgentSelector";
import { MobileSessionDrawer } from "./MobileSessionDrawer";
import { useMobile } from "@/hooks/useResponsive";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  contextCount: number;
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
  messagesLength: number;
  isExtracting: boolean;
  onExtractLearnings: () => void;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const ChatHeader = ({
  contextCount,
  selectedAgent,
  onSelectAgent,
  messagesLength,
  isExtracting,
  onExtractLearnings,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: ChatHeaderProps) => {
  const { isMobile } = useMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 sm:border-b border-border px-3 sm:px-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {isMobile && user && (
          <MobileSessionDrawer
            currentSessionId={currentSessionId}
            onSessionSelect={onSessionSelect}
            onNewSession={onNewSession}
          />
        )}
        {!isMobile && (
          <>
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">AI Assistant</h1>
              {contextCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-secondary/80 mt-1"
                  onClick={() => navigate('/')}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  {contextCount} memories
                </Badge>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* AgentSelector - Show on ALL devices */}
        <AgentSelector 
          selectedAgent={selectedAgent}
          onSelectAgent={onSelectAgent}
        />
        
        {isMobile ? (
          // Mobile: Compact menu for other actions
          <>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/evolution')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {messagesLength >= 4 && (
                    <DropdownMenuItem 
                      onClick={onExtractLearnings}
                      disabled={isExtracting}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isExtracting ? "Extracting..." : "Extract Learnings"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          // Desktop: Additional controls
          <>
            {contextCount > 0 && (
              <Link to="/evolution">
                <Button variant="outline" size="sm" className="h-10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            {user && messagesLength >= 4 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExtractLearnings}
                disabled={isExtracting}
                className="h-10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isExtracting ? "Extracting..." : "Extract"}
              </Button>
            )}
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} className="h-10">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
