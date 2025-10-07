import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredTier: 'premium';
  featureName: string;
}

const tierOrder = {
  free: 0,
  premium: 1,
};

export const SubscriptionGuard = ({ 
  children, 
  requiredTier, 
  featureName 
}: SubscriptionGuardProps) => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  const hasAccess = tierOrder[subscription.tier] >= tierOrder[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierNames = {
    premium: 'Premium',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-love-light via-white to-love-coral/10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full love-gradient mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl">Upgrade Required</CardTitle>
          <CardDescription>
            {featureName} is available on {tierNames[requiredTier]} plan and higher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Unlock this feature and many more by upgrading your subscription.
          </p>
          <div className="space-y-2">
            <Button 
              variant="love" 
              className="w-full"
              onClick={() => navigate('/#pricing')}
            >
              View Plans & Upgrade
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/app')}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
