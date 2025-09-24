import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-love-coral/20 z-50">
      <div className="container mx-auto px-6">
        {/* First line: Logo */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="love-gradient rounded-full p-2">
              <Heart className="text-white" size={24} />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
              Love Beyond Borders
            </span>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-love-heart hover:text-love-deep" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
            <Button variant="love" onClick={() => window.location.href = '/auth'}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </Button>
        </div>

        {/* Second line: Navigation (tablet) */}
        <div className="hidden md:block lg:hidden border-t border-love-coral/20">
          <nav className="flex items-center justify-center gap-8 py-3">
            <a href="#features" className="text-foreground hover:text-love-heart transition-colors">Features</a>
            <a href="#how-it-works" className="text-foreground hover:text-love-heart transition-colors">How It Works</a>
            <a href="#pricing" className="text-foreground hover:text-love-heart transition-colors">Pricing</a>
            <a href="#about" className="text-foreground hover:text-love-heart transition-colors">About</a>
          </nav>
        </div>

        {/* Third line: CTA Buttons (tablet) */}
        <div className="hidden md:flex lg:hidden items-center justify-center gap-4 pb-3 border-b border-love-coral/20">
          <Button variant="ghost" className="text-love-heart hover:text-love-deep" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
          <Button variant="love" onClick={() => window.location.href = '/auth'}>
            Get Started
          </Button>
        </div>

        {/* Desktop Navigation (single line) */}
        <div className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-love-coral/20">
          <a href="#features" className="text-foreground hover:text-love-heart transition-colors">Features</a>
          <a href="#how-it-works" className="text-foreground hover:text-love-heart transition-colors">How It Works</a>
          <a href="#pricing" className="text-foreground hover:text-love-heart transition-colors">Pricing</a>
          <a href="#about" className="text-foreground hover:text-love-heart transition-colors">About</a>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden lg:hidden py-4 border-t border-love-coral/20">
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
              <a 
                href="#about" 
                className="text-foreground hover:text-love-heart transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" className="text-love-heart w-full" onClick={() => window.location.href = '/auth'}>Sign In</Button>
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