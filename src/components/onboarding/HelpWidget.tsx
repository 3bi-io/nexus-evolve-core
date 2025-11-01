import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  icon: any;
  description: string;
  link: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    category: 'Basics',
    icon: Book,
    description: 'Learn the fundamentals of using Oneiros AI',
    link: '/docs/getting-started',
  },
  {
    id: 'multi-agent',
    title: 'Multi-Agent System',
    category: 'Features',
    icon: MessageCircle,
    description: 'Understand how our 9 AI agents work together',
    link: '/docs/multi-agent',
  },
  {
    id: 'browser-ai',
    title: 'Browser AI & Privacy',
    category: 'Features',
    icon: Video,
    description: 'Run AI models locally with WebGPU',
    link: '/browser-ai',
  },
  {
    id: 'credits',
    title: 'Credits & Pricing',
    category: 'Billing',
    icon: FileText,
    description: 'How time-based credits work',
    link: '/pricing',
  },
  {
    id: 'agents',
    title: 'Custom Agents',
    category: 'Advanced',
    icon: Book,
    description: 'Create your own specialized AI agents',
    link: '/agent-studio',
  },
  {
    id: 'api',
    title: 'API Documentation',
    category: 'Developers',
    icon: FileText,
    description: 'Integrate Oneiros into your applications',
    link: '/docs/api',
  },
];

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 hover:scale-110 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-[450px] z-50"
            >
              <Card className="h-full rounded-none shadow-2xl border-l">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold">Help Center</h2>
                          <p className="text-xs text-muted-foreground">
                            Find answers and resources
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search help articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Quick Actions
                        </h3>
                        <div className="grid gap-2">
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              // Restart product tour
                              localStorage.removeItem('hasCompletedProductTour');
                              window.location.reload();
                            }}
                          >
                            <Video className="h-4 w-4 mr-3" />
                            Restart Product Tour
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              window.open('https://discord.gg/oneiros', '_blank');
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-3" />
                            Join Discord Community
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        </div>
                      </div>

                      {/* Help Articles */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Help Articles
                        </h3>
                        <div className="space-y-2">
                          {filteredArticles.map((article) => {
                            const Icon = article.icon;
                            return (
                              <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                                  onClick={() => {
                                    window.location.href = article.link;
                                  }}
                                >
                                  <div className="flex items-start gap-3 flex-1 text-left">
                                    <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                                      <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                          {article.title}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          {article.category}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {article.description}
                                      </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                                  </div>
                                </Button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="p-6 border-t bg-muted/30">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Still need help?
                      </p>
                      <Button className="w-full" variant="default">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
