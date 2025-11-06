import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, Brain, MessageSquare, Store, Phone, Network, 
  BarChart3, Sparkles, Zap, ArrowRight, Keyboard, Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AI_SYSTEMS = [
  { icon: MessageSquare, label: 'AI Chat', color: 'text-blue-500' },
  { icon: Store, label: 'Agent Marketplace', color: 'text-green-500' },
  { icon: Phone, label: 'Voice AI', color: 'text-purple-500' },
  { icon: Network, label: 'Knowledge Graph', color: 'text-orange-500' },
  { icon: BarChart3, label: 'Analytics', color: 'text-pink-500' },
  { icon: Sparkles, label: 'Evolution', color: 'text-yellow-500' },
  { icon: Zap, label: 'AI Router', color: 'text-red-500' },
  { icon: Brain, label: 'AGI Dashboard', color: 'text-indigo-500' },
  { icon: Phone, label: 'Voice Manager', color: 'text-cyan-500' },
];

export function AgentPlatformShowcase() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 -mx-4 px-4">
      <div className="container mx-auto space-y-12">
        <div className="text-center space-y-4 px-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            <Sidebar className="h-4 w-4 mr-2" />
            Unified Platform Experience
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            One Platform. Nine AI Systems.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Zero Context Switching.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Stop juggling multiple AI tools. Access everything through a unified sidebar navigation. 
            <strong className="text-foreground"> Press Cmd+B anywhere to switch systems instantly.</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Visual Sidebar Preview */}
          <Card className="overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Badge variant="destructive" className="mb-2">Before: Tool Chaos</Badge>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span>
                    Open ChatGPT → Switch to Claude → Check analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span>
                    Lost context between 5 different tools
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span>
                    Re-authenticate, re-configure, repeat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-destructive">✗</span>
                    Can't connect data between systems
                  </li>
                </ul>
              </div>

              <div className="border-t pt-6 space-y-3">
                <Badge variant="default" className="mb-2">After: Unified Sidebar</Badge>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd+B</kbd> → Access all 9 systems
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Context flows between all AI systems
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Single sign-on, unified settings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Shared knowledge graph & memory
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Keyboard className="h-5 w-5 text-primary" />
                <div className="flex items-center gap-2 text-sm">
                  <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">⌘</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">B</kbd>
                  <span className="text-muted-foreground ml-2">Toggle sidebar anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: 9 AI Systems Grid */}
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">All Systems Included</h3>
                <p className="text-muted-foreground">
                  Every feature, accessible from one unified navigation
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {AI_SYSTEMS.map((system, idx) => {
                  const Icon = system.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg hover:from-primary/10 transition-all cursor-pointer group"
                    >
                      <Icon className={`h-6 w-6 ${system.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-center font-medium">{system.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Experience the Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Free tier includes full access to all 9 systems • No credit card required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
