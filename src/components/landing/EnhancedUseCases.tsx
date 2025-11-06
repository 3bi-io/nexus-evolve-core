import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, TrendingUp, Clock, DollarSign, CheckCircle2, Quote } from 'lucide-react';
import { enhancedUseCases } from '@/data/landing-use-cases';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function EnhancedUseCases() {
  const [selectedId, setSelectedId] = useState(enhancedUseCases[0].id);
  const navigate = useNavigate();
  
  const selectedCase = enhancedUseCases.find(uc => uc.id === selectedId) || enhancedUseCases[0];
  const Icon = selectedCase.icon;

  return (
    <section className="py-16 space-y-12">
      <div className="text-center space-y-4 px-4">
        <Badge variant="outline" className="text-base px-4 py-2">
          <TrendingUp className="h-4 w-4 mr-2" />
          Real Results from Real Teams
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          See How Teams Transform with AI
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          From startups to enterprises, see the measurable impact of our unified AI platform
        </p>
      </div>

      {/* Interactive Tabs */}
      <Tabs value={selectedId} onValueChange={setSelectedId} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto bg-transparent p-0">
          {enhancedUseCases.map((useCase) => {
            const UseCaseIcon = useCase.icon;
            return (
              <TabsTrigger
                key={useCase.id}
                value={useCase.id}
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary/10 data-[state=active]:border-primary rounded-lg border-2 border-transparent transition-all hover:border-primary/50"
              >
                <UseCaseIcon className="h-6 w-6" />
                <span className="text-sm font-medium">{useCase.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          {enhancedUseCases.map((useCase) => (
            <TabsContent key={useCase.id} value={useCase.id} className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Left: Story */}
                      <div className="p-8 space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{useCase.title}</h3>
                            <p className="text-lg text-muted-foreground">{useCase.tagline}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Badge variant="destructive" className="mb-2">Problem</Badge>
                            <p className="text-sm text-muted-foreground leading-relaxed">{useCase.problem}</p>
                          </div>
                          
                          <div>
                            <Badge variant="default" className="mb-2">Solution</Badge>
                            <p className="text-sm leading-relaxed">{useCase.solution}</p>
                          </div>
                        </div>

                        {/* Before/After */}
                        <div className="grid grid-cols-1 gap-3 p-4 bg-background rounded-lg">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-destructive uppercase">Before</span>
                            <p className="text-sm text-muted-foreground">{useCase.beforeState}</p>
                          </div>
                          <div className="border-t" />
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-primary uppercase">After</span>
                            <p className="text-sm font-medium">{useCase.afterState}</p>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-background rounded-lg">
                            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                            <div className="text-lg font-bold">{useCase.timeSaved}</div>
                            <div className="text-xs text-muted-foreground">Time Saved</div>
                          </div>
                          <div className="text-center p-3 bg-background rounded-lg">
                            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                            <div className="text-lg font-bold">{useCase.productivityGain}</div>
                            <div className="text-xs text-muted-foreground">Gain</div>
                          </div>
                          <div className="text-center p-3 bg-background rounded-lg">
                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                            <div className="text-lg font-bold">{useCase.roi}</div>
                            <div className="text-xs text-muted-foreground">ROI</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Features & Testimonial */}
                      <div className="p-8 space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Key Features Used</h4>
                          <ul className="space-y-3">
                            {useCase.keyFeatures.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {useCase.testimonial && (
                          <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6 space-y-4">
                              <Quote className="h-8 w-8 text-primary/40" />
                              <p className="text-sm italic leading-relaxed">
                                "{useCase.testimonial.quote}"
                              </p>
                              <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary-foreground">
                                    {useCase.testimonial.author.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">{useCase.testimonial.author}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {useCase.testimonial.role} at {useCase.testimonial.company}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {useCase.demoPrompt && (
                          <Button 
                            className="w-full"
                            size="lg"
                            onClick={() => navigate(`/chat?prompt=${encodeURIComponent(useCase.demoPrompt)}`)}
                          >
                            Try This Use Case Live
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </section>
  );
}
