import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

interface UpgradePromptProps {
  featureName: string;
  requiredTier: 'premium';
  compact?: boolean;
  className?: string;
}

export const UpgradePrompt = ({ 
  featureName, 
  requiredTier, 
  compact = false,
  className = ''
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  // Don't show if user already has access
  const tierOrder = { free: 0, premium: 1 };
  if (tierOrder[subscription.tier] >= tierOrder[requiredTier]) {
    return null;
  }

  const tierInfo = {
    premium: {
      name: 'Premium',
      icon: Crown,
      gradient: 'from-love-heart to-love-coral'
    }
  };

  const info = tierInfo[requiredTier];
  const Icon = info.icon;

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 bg-gradient-to-r ${info.gradient} rounded-lg text-white ${className}`}>
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span className="text-sm font-medium">
            {featureName} requires {info.name}
          </span>
        </div>
        <Button 
          size="sm" 
          variant="secondary"
          className="bg-white text-love-heart hover:bg-white/90"
          onClick={() => navigate('/#pricing')}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border-2 border-dashed border-love-coral/30 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${info.gradient} mb-4`}>
          <Icon className="text-white" size={24} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unlock {featureName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This feature is available on the {info.name} plan
        </p>
        <Button 
          variant="love"
          onClick={() => navigate('/#pricing')}
          className="w-full"
        >
          View {info.name} Plans
        </Button>
      </CardContent>
    </Card>
  );
};
