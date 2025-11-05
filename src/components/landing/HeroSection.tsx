import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, Brain, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative text-center space-y-8 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 animate-gradient" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
      >
        <motion.span 
          className="text-sm sm:text-base md:text-lg font-semibold text-primary"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🚀 Beta Access
        </motion.span>
        <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
          Live now - 500 free daily interactions
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground sm:hidden">
          500 free daily
        </span>
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-4 sm:px-0"
      >
        <span className="block sm:inline">The AI That Gets</span>{' '}
        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient block sm:inline">
          Smarter While You Sleep
        </span>
      </motion.h1>
      
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
        <strong>9 autonomous AI systems</strong> with temporal memory and multi-agent orchestration.
        <br className="hidden sm:block" />
        Join pioneering teams in our <strong className="text-primary">exclusive beta program</strong>.
      </p>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm max-w-3xl mx-auto px-4">
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Zap className="h-3 w-3" />
          <span className="hidden sm:inline">9 Production AI Systems</span>
          <span className="sm:hidden">9 AI Systems</span>
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-3 w-3" />
          <span className="hidden sm:inline">Bank-Level Security</span>
          <span className="sm:hidden">Secure</span>
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Brain className="h-3 w-3" />
          <span className="hidden sm:inline">20+ Edge Functions</span>
          <span className="sm:hidden">20+ Functions</span>
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Sparkles className="h-3 w-3" />
          <span className="hidden sm:inline">Bot & Fraud Protection</span>
          <span className="sm:hidden">Protected</span>
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 w-full sm:w-auto">
        <Button 
          size="lg" 
          onClick={() => navigate('/auth')}
          className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group touch-feedback min-h-[56px]"
        >
          Get Early Access Free
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => navigate('/getting-started')}
          className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 hover:bg-primary/10 touch-feedback min-h-[56px]"
        >
          Explore Live Demo
          <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm px-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="hidden sm:inline">Enterprise security included</span>
          <span className="sm:hidden">Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="hidden sm:inline">500 free credits daily forever</span>
          <span className="sm:hidden">500 free daily</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="hidden sm:inline">All features unlocked</span>
          <span className="sm:hidden">All features</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span>No card required</span>
        </div>
      </div>
    </div>
  );
}
