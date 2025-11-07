import { Card } from '@/components/ui/card';
import { steps } from '@/data/landing-steps';

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-muted/30 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
      <div className="container mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">3 Steps to 3x Productivity</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to AI-powered in under 5 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="p-8 bg-background hover:shadow-lg transition-shadow">
                <div className="p-0 space-y-4 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      {step.number}
                    </div>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
