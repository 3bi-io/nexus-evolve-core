import { Brain, Sparkles, BookOpen, Network, Cpu, Moon, Handshake } from "lucide-react";
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

const aiAgents = [
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
    color: "text-accent",
  },
  {
    id: "reasoning",
    name: "Reasoning Agent",
    icon: Brain,
    description: "Deep logical analysis & problem solving",
    color: "text-primary",
  },
  {
    id: "creative",
    name: "Creative Agent",
    icon: Sparkles,
    description: "Ideation & innovative solutions",
    color: "text-accent",
  },
  {
    id: "learning",
    name: "Learning Agent",
    icon: BookOpen,
    description: "Meta-learning & pattern analysis",
    color: "text-success",
  },
  {
    id: "huggingface",
    name: "HuggingFace Models",
    icon: Cpu,
    description: "Access to 400,000+ open-source models",
    color: "text-accent",
  },
  {
    id: "negotiator",
    name: "Negotiator Agent",
    icon: Handshake,
    description: "Dynamic pricing negotiation with Zara",
    color: "text-amber-500",
  },
];

const kimiModels = [
  {
    id: "kimi-8k",
    name: "Kimi 8K",
    icon: Moon,
    description: "Fast responses, 8K context window",
    color: "text-blue-500",
  },
  {
    id: "kimi-32k",
    name: "Kimi 32K",
    icon: Moon,
    description: "Balanced performance, 32K context",
    color: "text-blue-500",
  },
  {
    id: "kimi-128k",
    name: "Kimi 128K",
    icon: Moon,
    description: "Long documents, 128K context window",
    color: "text-blue-500",
  },
];

const allAgents = [...aiAgents, ...kimiModels];

export const AgentSelector = ({ selectedAgent, onSelectAgent }: AgentSelectorProps) => {
  const currentAgent = allAgents.find(a => a.id === selectedAgent) || allAgents[0];
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
        <DropdownMenuLabel>AI Agents</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {aiAgents.map((agent) => {
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
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-blue-500" />
          Kimi Models
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {kimiModels.map((model) => {
          const Icon = model.icon;
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelectAgent(model.id)}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <Icon className={`w-5 h-5 mt-0.5 ${model.color}`} />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {model.name}
                  {model.id === selectedAgent && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
