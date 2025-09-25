import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-love-coral/20 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-full p-1">
              <img 
                src="/src/assets/logo.png" 
                alt="Love Beyond Borders Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
              Love Beyond Borders
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-love-heart transition-colors">Features</a>
            <a href="#how-it-works" className="text-foreground hover:text-love-heart transition-colors">How It Works</a>
            <a href="#pricing" className="text-foreground hover:text-love-heart transition-colors">Pricing</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-love-heart hover:text-white" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
            <Button variant="love" onClick={() => window.location.href = '/auth'}>
              Get Started
            </Button>
          </div>

          {/* Tablet CTA + Mobile Menu */}
          <div className="flex lg:hidden items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-love-heart hover:text-white" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
              <Button variant="love" size="sm" onClick={() => window.location.href = '/auth'}>
                Get Started
              </Button>
            </div>
            
            {/* Mobile/Tablet Menu Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-love-coral/20">
            <nav className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-foreground hover:text-love-heart transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-foreground hover:text-love-heart transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="text-foreground hover:text-love-heart transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="flex flex-col gap-2 pt-4 md:hidden">
                <Button variant="ghost" className="text-love-heart hover:text-white w-full" onClick={() => window.location.href = '/auth'}>Sign In</Button>
                <Button variant="love" className="w-full" onClick={() => window.location.href = '/auth'}>Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;