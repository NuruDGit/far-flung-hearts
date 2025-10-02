import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface LockedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  requiredTier: 'premium' | 'super_premium';
  preview?: string;
}

export const LockedFeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  requiredTier,
  preview 
}: LockedFeatureCardProps) => {
  const navigate = useNavigate();

  const tierInfo = {
    premium: {
      name: 'Premium',
      badgeIcon: Zap,
      gradient: 'from-love-heart to-love-coral'
    },
    super_premium: {
      name: 'Super Premium',
      badgeIcon: Crown,
      gradient: 'from-love-deep to-love-heart'
    }
  };

  const info = tierInfo[requiredTier];
  const BadgeIcon = info.badgeIcon;

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-love-coral/30 hover:border-love-coral/50 transition-all group">
      {/* Locked overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/80 to-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
        <div className="text-center px-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${info.gradient} mb-3 shadow-lg`}>
            <Lock className="text-white" size={20} />
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${info.gradient} text-white text-xs font-semibold mb-2`}>
            <BadgeIcon size={12} />
            {info.name}
          </div>
          <Button 
            size="sm"
            variant="default"
            className={`bg-gradient-to-r ${info.gradient} hover:opacity-90 shadow-md`}
            onClick={() => navigate('/app/subscription')}
          >
            Unlock Feature
          </Button>
        </div>
      </div>

      {/* Card content (blurred behind overlay) */}
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${info.gradient} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
            <Icon className="text-love-heart" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-love-deep mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
        {preview && (
          <div className="text-xs text-muted-foreground italic">
            {preview}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
