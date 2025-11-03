import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('exit-intent-shown', 'true');
      }
    };

    const alreadyShown = localStorage.getItem('exit-intent-shown');
    if (!alreadyShown) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [user, hasShown]);

  const handleClaim = () => {
    navigate('/auth?intent=bonus');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary animate-bounce" />
              <DialogTitle>Join Our Beta Program 🚀</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            We're in beta - not pretending to be huge. But our tech is <strong>genuinely groundbreaking</strong>. 
            Join the first <strong className="text-primary">1,000 users</strong> and get:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="font-semibold">🎁 Beta benefits:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>✓ Lifetime founder pricing</li>
              <li>✓ 500 daily free credits forever</li>
              <li>✓ Direct access to founders</li>
              <li>✓ Shape the product roadmap</li>
              <li>✓ Beta tester badge forever</li>
            </ul>
          </div>

          <Button onClick={handleClaim} size="lg" className="w-full">
            Get Beta Access Free
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No credit card required • Full platform access
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}