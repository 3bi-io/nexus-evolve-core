import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pricingTiers } from '@/data/landing-pricing';

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-transparent -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
      <div className="container mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Beta Pricing - Lock It In Forever
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Founder Rates for Early Users</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join now and <strong>lock in founder pricing for life</strong>. Rates increase after beta.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={`p-8 hover:shadow-xl transition-all ${tier.popular ? 'border-primary shadow-lg scale-[1.05]' : 'hover:scale-[1.02]'}`}>
              <CardContent className="p-0 space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant={tier.popular ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    {tier.badge}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    {tier.price !== null ? (
                      <>
                        <span className="text-5xl font-bold">${tier.price}</span>
                        {tier.originalPrice && (
                          <span className="text-2xl text-muted-foreground line-through">${tier.originalPrice}</span>
                        )}
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
                    )}
                  </div>
                  <p className="text-sm text-primary font-semibold">{tier.credits}</p>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-primary flex-shrink-0 fill-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full text-base py-6" 
                  size="lg"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => navigate(tier.cta === 'Start Free' ? '/auth' : '/pricing')}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
