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
import { AI_AGENTS, KIMI_MODELS } from "@/config/models";

interface AgentSelectorProps {
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
}

const agentIcons: Record<string, any> = {
  auto: Network,
  general: Brain,
  reasoning: Brain,
  creative: Sparkles,
  learning: BookOpen,
  huggingface: Cpu,
  negotiator: Handshake,
};

const agentColors: Record<string, string> = {
  auto: "text-primary",
  general: "text-accent",
  reasoning: "text-primary",
  creative: "text-accent",
  learning: "text-success",
  huggingface: "text-accent",
  negotiator: "text-amber-500",
};

export const AgentSelector = ({ selectedAgent, onSelectAgent }: AgentSelectorProps) => {
  // Combine AI agents and Kimi models for selection
  const allOptions = [
    ...AI_AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: agentIcons[a.id] || Brain,
      color: agentColors[a.id] || "text-primary",
      type: 'agent' as const,
    })),
    ...KIMI_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      icon: Moon,
      color: "text-blue-500",
      type: 'kimi' as const,
    })),
  ];

  const currentOption = allOptions.find(a => a.id === selectedAgent) || allOptions[0];
  const AgentIcon = currentOption.icon;

  const agents = allOptions.filter(o => o.type === 'agent');
  const kimiModels = allOptions.filter(o => o.type === 'kimi');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AgentIcon className={`w-4 h-4 ${currentOption.color}`} />
          <span className="hidden sm:inline">{currentOption.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>AI Agents</DropdownMenuLabel>
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
