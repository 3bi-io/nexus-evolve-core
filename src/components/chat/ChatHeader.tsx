import { Brain, LogOut, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { AgentSelector } from "@/components/AgentSelector";
import { MobileSessionDrawer } from "./MobileSessionDrawer";
import { useResponsive } from "@/hooks/useResponsive";
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
  const { isMobile } = useResponsive();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Mobile: Minimal header with just session drawer and agent selector
  if (isMobile) {
    return (
      <div className="flex items-center justify-between gap-2 py-2 px-1 safe-top">
        <div className="flex items-center gap-1">
          {user && (
            <MobileSessionDrawer
              currentSessionId={currentSessionId}
              onSessionSelect={onSessionSelect}
              onNewSession={onNewSession}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          <AgentSelector 
            selectedAgent={selectedAgent}
            onSelectAgent={onSelectAgent}
          />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
        </div>
      </div>
    );
  }

  // Desktop: Full header with branding
  return (
    <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-xl bg-primary/10">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">AI Assistant</h1>
          {contextCount > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-secondary/80 mt-1"
              onClick={() => navigate('/evolution')}
            >
              <Brain className="w-3 h-3 mr-1" />
              {contextCount} memories
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <AgentSelector 
          selectedAgent={selectedAgent}
          onSelectAgent={onSelectAgent}
        />
        
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
      </div>
    </div>
  );
};
