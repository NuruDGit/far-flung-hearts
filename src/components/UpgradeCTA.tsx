import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export const UpgradeCTA = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  // Don't show for super_premium users (no higher tier)
  if (subscription.tier === 'super_premium') {
    return null;
  }

  const ctaContent = subscription.tier === 'premium' 
    ? {
        title: "Ready for Unlimited?",
        description: "Upgrade to Super Premium and unlock everything with no limits",
        features: ["Unlimited AI insights", "Unlimited storage", "Priority support"],
        icon: Crown,
        gradient: "from-love-deep via-love-heart to-love-coral",
        buttonText: "Upgrade to Super Premium"
      }
    : {
        title: "Unlock Premium Features",
        description: "Get unlimited access to video calls, AI insights, and more",
        features: ["Video calls", "AI Love Advisor", "Unlimited memories"],
        icon: Zap,
        gradient: "from-love-heart via-love-coral to-love-accent",
        buttonText: "Upgrade to Premium"
      };

  const Icon = ctaContent.icon;

  return (
    <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${ctaContent.gradient} border-transparent`}>
      <CardContent className="p-6 text-white relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-6 h-6" />
              <h3 className="text-xl font-semibold">{ctaContent.title}</h3>
            </div>
            <p className="text-white/90 mb-4 text-sm">
              {ctaContent.description}
            </p>
            <ul className="space-y-2 mb-4">
              {ctaContent.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => navigate('/app/subscription')}
              className="bg-white text-love-heart hover:bg-white/90 font-semibold"
            >
              {ctaContent.buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
    </Card>
  );
};
