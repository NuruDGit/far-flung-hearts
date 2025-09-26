import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Target, User, Menu, X, Bot, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppNavigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/app', icon: Home, label: 'Home' },
    { path: '/app/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/app/mood/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/goals', icon: Target, label: 'Goals' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <div className="hidden lg:block w-full bg-white/80 backdrop-blur-sm border-b border-love-coral/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-love-deep">Love Beyond Borders</span>
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${isActive(item.path) ? 'bg-love-heart text-white' : 'text-love-deep hover:bg-love-coral/20 hover:text-love-deep'}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tablet/Mobile Top Logo Bar */}
      <div className="lg:hidden w-full bg-white/80 backdrop-blur-sm border-b border-love-coral/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                />
              </div>
              <span className="font-bold text-love-deep text-lg md:text-xl">Love Beyond Borders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet/Mobile Navigation - Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur-sm border-t border-love-coral/20">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex-col gap-1 h-auto py-2 ${isActive(item.path) ? 'text-love-heart' : 'text-muted-foreground'}`}
                >
                  <item.icon size={20} />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet/Mobile spacing for bottom navigation */}
      <div className="lg:hidden h-20"></div>
    </>
  );
};

export default AppNavigation;