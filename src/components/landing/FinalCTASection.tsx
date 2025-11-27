import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <Card className="p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 text-center">
        <div className="space-y-8 max-w-3xl mx-auto">
          <Badge variant="default" className="text-base px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            🔥 Black Friday - Limited Time
          </Badge>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Black Friday AI Deal - Act Now
            </h2>
            <p className="text-xl text-muted-foreground">
              Production-ready platform with 38+ autonomous edge functions.
              <br />
              <strong className="text-foreground">Unlimited access to all features. Black Friday exclusive.</strong>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/chat')}
              className="text-lg px-12 py-7 shadow-2xl hover:scale-105 transition-all"
            >
              Get Black Friday Deal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/features')}
              className="text-lg px-12 py-7"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
