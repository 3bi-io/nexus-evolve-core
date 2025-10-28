import { Brain, Sparkles, BookOpen, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentSelectorProps {
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
}

const agents = [
  {
    id: "auto",
    name: "Auto (Coordinator)",
    icon: Network,
    description: "Automatically selects the best agent",
    color: "text-primary",
  },
  {
    id: "general",
    name: "General Assistant",
    icon: Brain,
    description: "Standard conversational AI",
    color: "text-blue-500",
  },
  {
    id: "reasoning",
    name: "Reasoning Agent",
    icon: Brain,
    description: "Deep logical analysis & problem solving",
    color: "text-purple-500",
  },
  {
    id: "creative",
    name: "Creative Agent",
    icon: Sparkles,
    description: "Ideation & innovative solutions",
    color: "text-pink-500",
  },
  {
    id: "learning",
    name: "Learning Agent",
    icon: BookOpen,
    description: "Meta-learning & pattern analysis",
    color: "text-green-500",
  },
];

export const AgentSelector = ({ selectedAgent, onSelectAgent }: AgentSelectorProps) => {
  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];
  const AgentIcon = currentAgent.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AgentIcon className={`w-4 h-4 ${currentAgent.color}`} />
          <span className="hidden sm:inline">{currentAgent.name}</span>
          <Badge variant="secondary" className="ml-1">
            Phase 3C
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Select AI Agent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <Icon className={`w-5 h-5 mt-0.5 ${agent.color}`} />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {agent.name}
                  {agent.id === selectedAgent && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {agent.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
