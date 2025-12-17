import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border/50 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="rounded-xl p-1.5 bg-gradient-to-br from-primary to-accent">
              <img 
                src="/logo.png" 
                alt="Lobebo Logo" 
                className="w-8 h-8 md:w-9 md:h-9 object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-foreground">
              Lobebo
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary font-medium" 
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
            <Button 
              variant="love" 
              className="rounded-full px-6"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <Button 
              variant="love" 
              size="sm" 
              className="hidden sm:flex rounded-full"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg">
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-foreground hover:text-primary transition-colors py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-foreground hover:text-primary transition-colors py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="text-foreground hover:text-primary transition-colors py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-foreground"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </Button>
                <Button 
                  variant="love" 
                  className="w-full rounded-full"
                  onClick={() => window.location.href = '/auth'}
                >
                  Get Started Free
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
