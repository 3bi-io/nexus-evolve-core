import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { features } from '@/data/landing-features';

export function FeaturesSection() {
  return (
    <section className="section-spacing space-mobile">
      <div className="text-center space-mobile px-4">
        <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
          <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          9 Integrated AI Systems
        </Badge>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          Never Lose Context. Never Stop Learning.
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
          Unlike ChatGPT or Claude, Oneiros is a <strong>complete AI ecosystem</strong> with enterprise security,
          temporal memory, and autonomous evolution. Protected by advanced bot detection and geographic risk blocking.
        </p>
      </div>

      <div className="grid-mobile">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="card-mobile hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] group border-primary/10 touch-feedback">
              <CardContent className="p-0 space-mobile">
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                    {feature.stat && (
                      <Badge variant="outline" className="text-xs font-mono text-primary border-primary/20">
                        {feature.stat}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
