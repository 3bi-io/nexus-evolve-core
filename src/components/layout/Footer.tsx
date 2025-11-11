import { Link } from "react-router-dom";
import { Brain, Github, Twitter, Linkedin, Sparkles, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container-mobile py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-6 h-6 text-primary" />
                <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="font-semibold text-lg">Oneiros.me</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your intelligent AI companion for reasoning, creativity, and real-time insights.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/agent-marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
                  Agent Marketplace
                </Link>
              </li>
              <li>
                <Link to="/voice-agent" className="text-muted-foreground hover:text-foreground transition-colors">
                  Voice Agent
                </Link>
              </li>
              <li>
                <Link to="/install" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/getting-started" className="text-muted-foreground hover:text-foreground transition-colors">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources - Only show for authenticated users */}
          {user && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base">For Members</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/agi-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    AGI Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/evolution" className="text-muted-foreground hover:text-foreground transition-colors">
                    Evolution
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link to="/api-access" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Access
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Legal & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Oneiros.me. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
