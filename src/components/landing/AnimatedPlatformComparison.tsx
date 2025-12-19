import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SafeAnimatePresence } from '@/components/ui/SafeAnimatePresence';
import { 
  MessageSquare, Store, Phone, Network, BarChart3, 
  Sparkles, Zap, Brain, X, Check, ArrowRight, Loader2,
  ExternalLink, RefreshCw
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useResponsive';

const TOOLS_SEQUENCE = [
  { name: 'ChatGPT', icon: MessageSquare, color: '#10a37f' },
  { name: 'Claude', icon: Brain, color: '#d97706' },
  { name: 'Analytics Tool', icon: BarChart3, color: '#8b5cf6' },
  { name: 'Voice Platform', icon: Phone, color: '#ec4899' },
  { name: 'Knowledge Base', icon: Network, color: '#3b82f6' },
];

const UNIFIED_FEATURES = [
  { name: 'AI Chat', icon: MessageSquare },
  { name: 'Agent Marketplace', icon: Store },
  { name: 'Voice AI', icon: Phone },
  { name: 'Knowledge Graph', icon: Network },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Evolution', icon: Sparkles },
  { name: 'AI Router', icon: Zap },
  { name: 'AGI Dashboard', icon: Brain },
];

export function AnimatedPlatformComparison() {
  const [beforeStep, setBeforeStep] = useState(0);
  const [showUnifiedFeatures, setShowUnifiedFeatures] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [enableAnimations, setEnableAnimations] = useState(false);
  const isMobile = useIsMobile();

  // Delay animation initialization on mobile to prevent timing issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableAnimations(true);
    }, isMobile ? 200 : 0);
    return () => clearTimeout(timer);
  }, [isMobile]);

  // Pre-calculate current tool with bounds checking
  const currentTool = useMemo(() => {
    if (!TOOLS_SEQUENCE || TOOLS_SEQUENCE.length === 0) {
      console.warn('[AnimatedPlatformComparison] TOOLS_SEQUENCE is empty');
      return null;
    }
    return TOOLS_SEQUENCE[beforeStep % TOOLS_SEQUENCE.length];
  }, [beforeStep]);

  // Pre-calculate current feature with bounds checking
  const currentFeature = useMemo(() => {
    if (!UNIFIED_FEATURES || UNIFIED_FEATURES.length === 0) {
      console.warn('[AnimatedPlatformComparison] UNIFIED_FEATURES is empty');
      return null;
    }
    const idx = showUnifiedFeatures % UNIFIED_FEATURES.length;
    return UNIFIED_FEATURES[idx];
  }, [showUnifiedFeatures]);

  // Before animation - switching between tools
  useEffect(() => {
    if (!enableAnimations) return;
    
    const interval = setInterval(() => {
      setBeforeStep((prev) => {
        if (prev >= TOOLS_SEQUENCE.length - 1) {
          setCycleCount(c => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [enableAnimations]);

  // After animation - showing unified features sequentially
  useEffect(() => {
    if (!enableAnimations) return;
    
    const interval = setInterval(() => {
      setShowUnifiedFeatures((prev) => {
        if (prev >= UNIFIED_FEATURES.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [enableAnimations]);

  // Fallback if data is invalid
  if (!currentTool || !currentFeature) {
    return (
      <section className="py-16 bg-gradient-to-br from-destructive/5 to-background">
        <div className="container mx-auto">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading comparison...</p>
          </Card>
        </div>
      </section>
    );
  }

  const ToolIcon = currentTool.icon;
  const FeatureIcon = currentFeature.icon;

  return (
    <section className="py-16 bg-gradient-to-br from-destructive/5 to-background">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            See The Difference in Action
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Stop Context Switching. Start Shipping.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how the unified platform eliminates the chaos of juggling multiple AI tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE: Multiple Tools Chaos */}
          <Card className="relative overflow-hidden border-destructive/20">
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="destructive" className="gap-1">
                <X className="h-3 w-3" />
                Before
              </Badge>
            </div>
            
            <div className="p-8 space-y-6 min-h-[500px]">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-destructive">Tool Switching Hell</h3>
                <p className="text-sm text-muted-foreground">
                  Average team switches tools {TOOLS_SEQUENCE.length}+ times per task
                </p>
              </div>

              {/* Animated Tool Windows - Direct Render Pattern */}
              <div className="relative h-[350px]">
                <SafeAnimatePresence mode="wait">
                  {enableAnimations && (
                    <motion.div
                      key={`${currentTool.name}-${cycleCount}`}
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Card className="h-full border-2" style={{ borderColor: currentTool.color }}>
                        <div className="p-6 space-y-4">
                          {/* Fake browser bar */}
                          <div className="flex items-center gap-2 pb-4 border-b">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-destructive/50" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                              <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="flex-1 bg-muted rounded px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                              <ExternalLink className="h-3 w-3" />
                              {currentTool.name.toLowerCase().replace(' ', '')}.com
                            </div>
                          </div>

                          {/* Tool content */}
                          <div className="flex items-center gap-4">
                            <div 
                              className="h-16 w-16 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${currentTool.color}20` }}
                            >
                              <ToolIcon className="h-8 w-8" style={{ color: currentTool.color }} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{currentTool.name}</h4>
                              <p className="text-sm text-muted-foreground">Loading...</p>
                            </div>
                          </div>

                          {/* Simulated content */}
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                            <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
                          </div>

                          {/* Loading indicator */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Switching tools... losing context...
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </SafeAnimatePresence>

                {/* Chaos indicators */}
                <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1">
                  {TOOLS_SEQUENCE.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-8 rounded-full transition-all ${
                        idx === beforeStep ? 'bg-destructive' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">5+</div>
                  <div className="text-xs text-muted-foreground">Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">60%</div>
                  <div className="text-xs text-muted-foreground">Time Lost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">0</div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                </div>
              </div>
            </div>
          </Card>

          {/* AFTER: Unified Platform */}
          <Card className="relative overflow-hidden border-primary/20">
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                After
              </Badge>
            </div>
            
            <div className="p-8 space-y-6 min-h-[500px]">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">One Unified Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Everything accessible from a single sidebar
                </p>
              </div>

              {/* Unified Sidebar Animation */}
              <div className="relative h-[350px] flex gap-4">
                {/* Sidebar */}
                <motion.div 
                  className="w-16 bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 flex flex-col gap-2 p-2 overflow-hidden"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  {UNIFIED_FEATURES.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.name}
                        className={`h-12 w-12 rounded-lg flex items-center justify-center transition-all ${
                          idx <= showUnifiedFeatures
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        animate={{
                          scale: idx === showUnifiedFeatures ? 1.1 : 1,
                          y: idx === showUnifiedFeatures ? -2 : 0,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Main Content Area - Direct Render Pattern */}
                <div className="flex-1 space-y-4">
                  <SafeAnimatePresence mode="wait">
                    {enableAnimations && (
                      <motion.div
                        key={showUnifiedFeatures}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                          <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FeatureIcon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold">{currentFeature.name}</h4>
                                <p className="text-xs text-muted-foreground">Instant access</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="h-2 bg-primary/20 rounded" />
                              <div className="h-2 bg-primary/20 rounded w-4/5" />
                              <div className="h-2 bg-primary/20 rounded w-3/5" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Check className="h-4 w-4" />
                              Context preserved across all systems
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </SafeAnimatePresence>

                  {/* Keyboard shortcut hint */}
                  <motion.div
                    className="flex items-center gap-2 text-xs text-muted-foreground justify-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘B</kbd>
                    <span>Toggle sidebar anytime</span>
                  </motion.div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div className="text-xs text-muted-foreground">Platform</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">3x</div>
                  <div className="text-xs text-muted-foreground">Faster</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Arrow */}
        <div className="flex justify-center">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-lg font-semibold text-primary"
          >
            <span>Switch to unified platform</span>
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
