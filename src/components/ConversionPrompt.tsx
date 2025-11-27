import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ConversionPromptProps {
  open: boolean;
  onClose: () => void;
  interactionCount: number;
}

export function ConversionPrompt({ open, onClose, interactionCount }: ConversionPromptProps) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleSignUp = () => {
    navigate('/auth?mode=signup&redirect=' + encodeURIComponent(window.location.pathname));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  return (
    <Dialog open={open && !isClosing} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <DialogTitle className="text-center">
            Loving Oneiros?
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              You've had {interactionCount} great interactions! 🎉
            </p>
            <p>
              Sign up to save your conversations, preferences, and unlock personalized AI experiences.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <div className="flex items-start gap-3 text-sm">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Save Your Progress</p>
              <p className="text-muted-foreground">Keep all your conversations and history</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Personalized AI</p>
              <p className="text-muted-foreground">AI learns from your interactions</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">100% Free</p>
              <p className="text-muted-foreground">All features, no credit card required</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleSignUp} size="lg" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Sign Up Free
          </Button>
          <Button onClick={handleClose} variant="ghost" size="sm" className="w-full">
            <X className="w-4 h-4 mr-2" />
            Remind Me Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}