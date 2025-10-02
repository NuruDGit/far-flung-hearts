import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Target, User, Menu, X, Bot, BarChart3, Calendar, Gamepad2, Gift, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasFeatureAccess } from '@/config/subscriptionFeatures';

const AppNavigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { subscription } = useAuth();

  const navItems = [
    { path: '/app', icon: Home, label: 'Home', tier: 'free' as const },
    { path: '/app/messages', icon: MessageCircle, label: 'Messages', tier: 'free' as const },
    { path: '/app/calendar', icon: Calendar, label: 'Calendar', tier: 'free' as const },
    { path: '/app/goals', icon: Target, label: 'Goals', tier: 'premium' as const },
    { path: '/app/games', icon: Gamepad2, label: 'Games', tier: 'free' as const },
    { path: '/app/wishlist', icon: Gift, label: 'Wishlist', tier: 'free' as const },
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
                  src="/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-love-deep">Love Beyond Borders</span>
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const hasAccess = item.tier === 'free' || hasFeatureAccess(subscription.tier, item.tier === 'premium' ? 'goals' : 'unlimitedMemory');
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 relative ${isActive(item.path) ? 'bg-love-heart text-white' : 'text-love-deep hover:bg-love-coral/20 hover:text-love-deep'}`}
                    >
                      <item.icon size={16} />
                      {item.label}
                      {!hasAccess && (
                        <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4 bg-love-heart/10 text-love-heart border-love-heart/30">
                          <Crown className="w-2 h-2 mr-0.5" />
                          Pro
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
              <Link to="/app/subscription">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-love-deep hover:bg-love-coral/20 hover:text-love-deep"
                >
                  <Crown size={16} />
                  Upgrade
                </Button>
              </Link>
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
                  src="/logo.png" 
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
            {navItems.map((item) => {
              const hasAccess = item.tier === 'free' || hasFeatureAccess(subscription.tier, item.tier === 'premium' ? 'goals' : 'unlimitedMemory');
              return (
                <Link key={item.path} to={item.path} className="flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full flex-col gap-1 h-auto py-2 relative ${isActive(item.path) ? 'text-love-heart' : 'text-muted-foreground'}`}
                  >
                    <item.icon size={20} />
                    <span className="text-xs">{item.label}</span>
                    {!hasAccess && (
                      <Crown className="w-2 h-2 absolute top-1 right-1 text-love-heart" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tablet/Mobile spacing for bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default AppNavigation;