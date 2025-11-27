import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentFeatures } from '@/data/landing-agent-features';

export function AgentSystemShowcase() {
  const navigate = useNavigate();

  return (
    <section className="section-spacing bg-gradient-to-b from-primary/5 to-background -mx-4 px-4">
      <div className="container mx-auto space-mobile">
        <div className="text-center space-mobile px-4">
          <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
            🚀 Production-Ready - 38+ Edge Functions Live
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            AI That Works While You Sleep
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Automated trend monitoring every 6 hours. Content generation pipelines running continuously. 
            Smart caching reducing costs by 70%. Multi-modal workflows chaining vision, generation, and reasoning.
          </p>
        </div>

        <div className="grid-mobile max-w-6xl mx-auto">
          {agentFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-mobile hover:shadow-xl transition-all hover:scale-105 active:scale-95 touch-feedback">
                <div className="space-mobile">
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.color}`} />
                  <h3 className="text-base sm:text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center space-mobile px-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/agent-studio')}
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 shadow-lg hover:scale-105 active:scale-95 transition-all touch-feedback min-h-[56px]"
          >
            Start Building Agents
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">
            100% Free • Unlimited Access • No Account Required
          </p>
        </div>
      </div>
    </section>
  );
}
