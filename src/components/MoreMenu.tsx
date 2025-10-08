import { User, Heart, Smile, TrendingUp, Gamepad2, Gift, Crown, Bell, HelpCircle, Shield, LogOut, Image } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { hasFeatureAccess } from '@/config/subscriptionFeatures';

interface MoreMenuProps {
  onItemClick?: () => void;
}

export const MoreMenu = ({ onItemClick }: MoreMenuProps) => {
  const { subscription, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleNavigation = (path: string, requiresPremium?: boolean) => {
    if (requiresPremium && !hasFeatureAccess(subscription.tier, 'goals')) {
      navigate('/app/subscription');
    } else {
      navigate(path);
    }
    onItemClick?.();
  };

  const menuSections = [
    {
      label: 'Account',
      items: [
        { icon: User, label: 'Profile Settings', path: '/app/profile' },
        { icon: Bell, label: 'Notifications', path: '/app/notification-settings' },
      ]
    },
    {
      label: 'Features',
      items: [
        { icon: Image, label: 'Memory Vault', path: '/app/memory-vault', premium: true },
        { icon: Heart, label: 'AI Advisor', path: '/app/advisor', premium: true },
        { icon: Smile, label: 'Mood Tracker', path: '/app/mood' },
        { icon: TrendingUp, label: 'Mood Analytics', path: '/app/mood/analytics', premium: true },
        { icon: Gamepad2, label: 'Games', path: '/app/games' },
        { icon: Gift, label: 'Wishlist', path: '/app/wishlist' },
      ]
    },
    {
      label: 'Support',
      items: [
        { icon: Crown, label: 'Upgrade to Premium', path: '/app/subscription', highlight: true },
        { icon: HelpCircle, label: 'Help & Support', path: '/help-center' },
      ]
    }
  ];

  return (
    <div className="py-2">
      {menuSections.map((section, idx) => (
        <div key={section.label}>
          {idx > 0 && <Separator className="my-2" />}
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">{section.label}</p>
            {section.items.map((item) => {
              const isPremium = item.premium && !hasFeatureAccess(subscription.tier, 'goals');
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start gap-3 mb-0.5 ${
                    item.highlight ? 'text-love-heart hover:text-love-heart hover:bg-love-heart/10' : ''
                  }`}
                  onClick={() => handleNavigation(item.path, item.premium)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isPremium && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-love-heart/10 text-love-heart border-love-heart/30">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                      Pro
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      
      {isAdmin && (
        <>
          <Separator className="my-2" />
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Admin</p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 mb-0.5"
              onClick={() => handleNavigation('/admin')}
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </div>
        </>
      )}

      <Separator className="my-2" />
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            signOut();
            onItemClick?.();
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
