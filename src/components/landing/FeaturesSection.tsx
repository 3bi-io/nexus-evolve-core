import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { features } from '@/data/landing-features';

export function FeaturesSection() {
  return (
    <section className="py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-base px-4 py-2">
          <Rocket className="h-4 w-4 mr-2" />
          9 Integrated AI Systems
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold">
          Never Lose Context. Never Stop Learning.
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Unlike ChatGPT or Claude, Oneiros is a <strong>complete AI ecosystem</strong> with enterprise security,
          temporal memory, and autonomous evolution. Protected by advanced bot detection and geographic risk blocking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="p-6 hover:shadow-xl transition-all hover:scale-[1.02] group border-primary/10">
              <CardContent className="p-0 space-y-4">
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
