import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Target, Calendar, MoreHorizontal, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasFeatureAccess } from '@/config/subscriptionFeatures';
import { MoreMenu } from './MoreMenu';

const AppNavigation = () => {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { subscription } = useAuth();

  const navItems = [
    { path: '/app', icon: Home, label: 'Home', tier: 'free' as const },
    { path: '/app/messages', icon: MessageCircle, label: 'Messages', tier: 'free' as const },
    { path: '/app/calendar', icon: Calendar, label: 'Calendar', tier: 'free' as const },
    { path: '/app/goals', icon: Target, label: 'Goals', tier: 'premium' as const },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <div className="hidden lg:block w-full bg-white/95 backdrop-blur-sm border-b border-love-coral/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="rounded-full p-1">
                <img 
                  src="/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-love-deep">Love Beyond Borders</span>
            </Link>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const hasAccess = item.tier === 'free' || hasFeatureAccess(subscription.tier, 'goals');
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 ${isActive(item.path) ? 'bg-love-heart text-white hover:bg-love-heart/90' : 'text-love-deep hover:bg-love-coral/20 hover:text-love-deep'}`}
                    >
                      <item.icon size={16} />
                      {item.label}
                      {!hasAccess && (
                        <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4 bg-love-heart/10 text-love-heart border-love-heart/30">
                          <Crown className="w-2.5 h-2.5" />
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-love-deep hover:bg-love-coral/20 hover:text-love-deep"
                  >
                    <MoreHorizontal size={16} />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border border-love-coral/20 z-50">
                  <MoreMenu />
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Top Logo Bar */}
      <div className="lg:hidden w-full bg-white/95 backdrop-blur-sm border-b border-love-coral/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-14">
            <Link to="/app" className="flex items-center gap-2">
              <div className="rounded-full p-1">
                <img 
                  src="/logo.png" 
                  alt="Love Beyond Borders Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-love-deep">Love Beyond Borders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-white/95 backdrop-blur-sm border-t border-love-coral/20 shadow-lg">
          <div className="flex items-center justify-around py-2 px-1">
            {navItems.map((item) => {
              const hasAccess = item.tier === 'free' || hasFeatureAccess(subscription.tier, 'goals');
              return (
                <Link key={item.path} to={item.path} className="flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full flex-col gap-0.5 h-auto py-2 px-1 relative hover:bg-love-coral/10 ${
                      isActive(item.path) ? 'text-love-heart' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                    <span className="text-[10px] font-medium truncate w-full">{item.label}</span>
                    {!hasAccess && (
                      <Crown className="w-2.5 h-2.5 absolute top-1 right-1 text-love-heart" />
                    )}
                  </Button>
                </Link>
              );
            })}
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex-col gap-0.5 h-auto py-2 px-1 text-muted-foreground hover:bg-love-coral/10"
                  >
                    <MoreHorizontal size={22} />
                    <span className="text-[10px] font-medium">More</span>
                  </Button>
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl bg-white/95 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100%-60px)] mt-4">
                  <MoreMenu onItemClick={() => setIsSheetOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile spacing for bottom navigation */}
      <div className="lg:hidden h-[72px]"></div>
    </>
  );
};

export default AppNavigation;