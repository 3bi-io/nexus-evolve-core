import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-4 pb-24 sm:pb-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Essential Links */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/sitemap" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
          </nav>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <a
                href="https://github.com/oneiros-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/oneiros_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/oneiros-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <span className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Oneiros.me
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
