import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, Brain, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

      <Badge variant="secondary" className="gap-1.5 px-4 py-2 text-base animate-pulse">
        <Sparkles className="h-4 w-4" />
        🚀 Beta Launch • Limited Early Access • Join First 1,000 Users
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1]">
        The AI That Gets
        <span className="text-primary block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Smarter While You Sleep
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        <strong>9 autonomous AI systems</strong> with temporal memory and multi-agent orchestration.
        <br className="hidden sm:block" />
        Join pioneering teams in our <strong className="text-primary">exclusive beta program</strong>.
      </p>

      <div className="flex flex-wrap justify-center gap-4 text-sm max-w-3xl mx-auto">
        <Badge variant="outline" className="gap-1.5">
          <Zap className="h-3 w-3" />
          9 Production AI Systems
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Shield className="h-3 w-3" />
          Bank-Level Security
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Brain className="h-3 w-3" />
          20+ Edge Functions
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3 w-3" />
          Bot & Fraud Protection
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          size="lg" 
          onClick={() => navigate('/auth')}
          className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
        >
          Get Early Access Free
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => navigate('/getting-started')}
          className="text-lg px-10 py-7 hover:bg-primary/10"
        >
          Explore Live Demo
          <Sparkles className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-primary" />
          <span>Enterprise security included</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-primary" />
          <span>500 free credits daily forever</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" />
          <span>All features unlocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
}
