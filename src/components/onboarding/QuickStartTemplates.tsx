import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Image, 
  Brain, 
  Search, 
  Code, 
  Zap,
  ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: any;
  badge?: string;
  route: string;
  prompt?: string;
}

const templates: Template[] = [
  {
    id: 'chat',
    title: 'Start Chatting',
    description: 'Begin a conversation with our multi-agent AI system',
    icon: MessageSquare,
    badge: 'Popular',
    route: '/',
    prompt: 'Hello! I\'d like to learn how to use Oneiros AI effectively.',
  },
  {
    id: 'image-gen',
    title: 'Generate Images',
    description: 'Create stunning images with AI-powered generation',
    icon: Image,
    route: '/multimodal-studio',
  },
  {
    id: 'browser-ai',
    title: 'Private AI',
    description: 'Run AI models locally in your browser with WebGPU',
    icon: Brain,
    badge: 'Privacy',
    route: '/browser-ai',
  },
  {
    id: 'agents',
    title: 'Custom Agents',
    description: 'Create and customize your own AI agents',
    icon: Zap,
    route: '/agent-studio',
  },
  {
    id: 'code',
    title: 'Code Assistant',
    description: 'Get help with coding and technical questions',
    icon: Code,
    route: '/',
    prompt: 'I need help with a coding problem. Can you assist me?',
  },
  {
    id: 'search',
    title: 'AI Search',
    description: 'Search the web with AI-powered insights',
    icon: Search,
    route: '/',
    prompt: 'Can you search for the latest developments in AI technology?',
  },
];

export function QuickStartTemplates() {
  const navigate = useNavigate();

  const handleTemplateClick = (template: Template) => {
    if (template.prompt) {
      navigate(template.route, { state: { initialPrompt: template.prompt } });
    } else {
      navigate(template.route);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Quick Start</h2>
        <p className="text-muted-foreground">
          Choose a template to get started quickly
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  {template.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {template.badge}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group-hover:bg-primary/10"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
