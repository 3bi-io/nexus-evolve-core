import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Smartphone, Zap, Wifi } from "lucide-react";

export function InstallSuccessDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleAppInstalled = () => {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setOpen(true);
      }, 500);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary animate-in zoom-in" />
          </div>
          <DialogTitle className="text-center text-xl">
            App Installed Successfully! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Oneiros.me is now on your home screen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Find it on your home screen</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Look for the Oneiros.me icon among your apps
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Instant launch</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Open directly from your home screen for faster access
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Works offline</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Access your AI assistant even without internet
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => setOpen(false)} className="w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
