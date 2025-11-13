import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { ResponsiveSection } from "@/components/layout/ResponsiveSection";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Download, CheckCircle2, Apple, Chrome, Zap } from "lucide-react";
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useState, useEffect } from "react";

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <MarketingLayout title="Install App">
      <SEO
        title="Install Oneiros.me - Progressive Web App"
        description="Install Oneiros.me on your device for a native app experience. Works offline with push notifications and instant access."
        keywords="install oneiros, PWA, progressive web app, install app"
        canonical="https://oneiros.me/install"
      />
      
      <ResponsiveContainer size="lg" padding="lg">
        <ResponsiveSection spacing="lg" className="text-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Download className="h-5 w-5 mr-2" />
              Progressive Web App
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Install Oneiros.me
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the full app experience on any device. Works offline, loads instantly, and feels native.
            </p>
          </div>

          {isInstalled ? (
            <Card className="p-8 bg-success/10 border-success/20">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Already Installed!</h2>
              <p className="text-muted-foreground">
                You're all set. Oneiros.me is installed on your device.
              </p>
            </Card>
          ) : deferredPrompt ? (
            <Card className="p-8">
              <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Ready to Install</h2>
              <Button size="lg" onClick={handleInstall} className="mb-4">
                <Download className="h-5 w-5 mr-2" />
                Install Now
              </Button>
              <p className="text-sm text-muted-foreground">
                One click to add Oneiros.me to your home screen
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="p-8">
                <Monitor className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">How to Install</h2>
                <p className="text-muted-foreground mb-6">
                  Follow the instructions below for your device
                </p>
              </Card>

              {/* iOS Instructions */}
              <Card className="p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Apple className="h-8 w-8" />
                  <h3 className="text-xl font-bold">iOS (iPhone/iPad)</h3>
                </div>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">1.</span>
                    <span>Open this page in Safari (required for iOS)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">2.</span>
                    <span>Tap the Share button (square with arrow) at the bottom</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">3.</span>
                    <span>Scroll down and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">4.</span>
                    <span>Tap "Add" in the top right corner</span>
                  </li>
                </ol>
              </Card>

              {/* Android Instructions */}
              <Card className="p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Chrome className="h-8 w-8" />
                  <h3 className="text-xl font-bold">Android (Chrome)</h3>
                </div>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">1.</span>
                    <span>Open this page in Chrome</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">2.</span>
                    <span>Tap the menu (three dots) in the top right</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">3.</span>
                    <span>Tap "Install app" or "Add to Home screen"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">4.</span>
                    <span>Tap "Install" when prompted</span>
                  </li>
                </ol>
              </Card>

              {/* Desktop Instructions */}
              <Card className="p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-8 w-8" />
                  <h3 className="text-xl font-bold">Desktop (Chrome/Edge)</h3>
                </div>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">1.</span>
                    <span>Look for the install icon in the address bar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">2.</span>
                    <span>Click the install icon (or menu → "Install Oneiros.me")</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono font-bold">3.</span>
                    <span>Click "Install" in the popup</span>
                  </li>
                </ol>
              </Card>
            </div>
          )}

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card className="p-6">
              <Smartphone className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Access your AI tools even without internet
              </p>
            </Card>
            <Card className="p-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Instant Launch</h3>
              <p className="text-sm text-muted-foreground">
                Launch from your home screen like a native app
              </p>
            </Card>
            <Card className="p-6">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Always Updated</h3>
              <p className="text-sm text-muted-foreground">
                Automatically updates to the latest version
              </p>
            </Card>
          </div>
        </ResponsiveSection>
      </ResponsiveContainer>
    </MarketingLayout>
  );
}
