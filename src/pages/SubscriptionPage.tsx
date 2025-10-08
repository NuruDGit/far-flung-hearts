import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Heart, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import AppNavigation from "@/components/AppNavigation";
import { STRIPE_CONFIG } from "@/config/stripe";

const SubscriptionPage = () => {
  const { user, subscription, loading: authLoading, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  // Check for success/cancel parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been upgraded. Refreshing...",
      });
      // Refresh subscription status
      refreshSubscription?.();
      // Clear the URL parameters
      window.history.replaceState({}, '', '/app/subscription');
    } else if (params.get('cancelled') === 'true') {
      toast({
        title: "Payment Cancelled",
        description: "You can upgrade anytime you're ready.",
      });
      // Clear the URL parameters
      window.history.replaceState({}, '', '/app/subscription');
    }
  }, [refreshSubscription]);

  if (!user && !authLoading) {
    return <Navigate to="/auth" />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  // Helper to redirect to checkout, handling iframe scenarios
  const redirectToCheckout = (url: string) => {
    try {
      // If we're in an iframe, try to break out to the top window
      if (window.self !== window.top) {
        window.top!.location.href = url;
      } else {
        // Normal redirect
        window.location.assign(url);
      }
    } catch (e) {
      // If blocked by browser security, open in new tab
      window.open(url, '_blank');
      toast({
        title: "Opening checkout",
        description: "Stripe checkout opened in a new tab",
      });
    }
  };

  const handleCheckout = async (priceId: string | null, tierName: string) => {
    if (!priceId) {
      toast({
        title: "You're on the Free plan",
        description: "You're already using the free tier!",
      });
      return;
    }

    setLoading(tierName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        redirectToCheckout(data.url);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (tierKey: 'free' | 'premium_monthly' | 'premium_annual') => {
    if (tierKey === 'free') return subscription.tier === 'free';
    return subscription.product_id === STRIPE_CONFIG.premium_monthly.product_id || 
           subscription.product_id === STRIPE_CONFIG.premium_annual.product_id;
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Heart,
      description: "Try before you commit",
      features: [
        "Basic messaging (100/day)",
        "Mood logging (3/day)",
        "Memory vault (5 photos)",
        "AI chat (3 questions/day)",
        "Basic goals (2 max)",
        "One video call trial (10 min)",
        "Lobebo branding"
      ],
      buttonText: "Current Plan",
      tierKey: 'free' as const,
      priceId: null,
    },
    {
      name: "Premium",
      price: "$6.99",
      period: "month",
      icon: Crown,
      description: "Everything you need for love",
      features: [
        "Everything in Free",
        "Unlimited messaging & calling",
        "Unlimited mood logging & analytics",
        "Unlimited calendar events & sync",
        "Unlimited goals, tasks & memory vault",
        "Advanced AI insights & recommendations",
        "Book recommendations",
        "Priority support",
        "Custom themes & data export",
        "Ad-free, no branding"
      ],
      buttonText: "Upgrade Monthly",
      tierKey: 'premium_monthly' as const,
      priceId: STRIPE_CONFIG.premium_monthly.price_id,
      popular: true,
    },
    {
      name: "Premium Annual",
      price: "$59",
      period: "year",
      originalPrice: "$83.88",
      savings: "Save 30%",
      icon: Sparkles,
      description: "Best value - 2 months free!",
      features: [
        "Everything in Premium Monthly",
        "Save $24.88 per year",
        "Lock in current pricing",
        "Priority feature requests",
      ],
      buttonText: "Upgrade Annually",
      tierKey: 'premium_annual' as const,
      priceId: STRIPE_CONFIG.premium_annual.price_id,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-peach/20 via-background to-background">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent mb-4">
            Choose Your Love Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upgrade to unlock premium features and enhance your relationship
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan.tierKey);
            
            return (
              <Card 
                key={index} 
                className={`relative hover:shadow-lg transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-love-heart transform scale-105' : ''
                } ${
                  isCurrent ? 'ring-2 ring-green-500' : 'border-love-coral/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-love-heart to-love-deep text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {plan.savings && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {plan.savings}
                    </div>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto ${
                    plan.popular || plan.savings ? 'bg-gradient-to-r from-love-heart to-love-deep' : 'bg-gradient-to-r from-love-light to-love-coral'
                  } mb-4`}>
                    <plan.icon className="text-white" size={28} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                      {plan.price}
                      <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice}/year
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="text-love-heart flex-shrink-0" size={16} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={isCurrent ? "outline" : "default"}
                    className={isCurrent ? "" : "bg-gradient-to-r from-love-heart to-love-deep hover:opacity-90"}
                    onClick={() => handleCheckout(plan.priceId, plan.name)}
                    disabled={loading === plan.name || isCurrent}
                  >
                    {loading === plan.name ? "Processing..." : isCurrent ? "Current Plan" : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            All plans include end-to-end encryption and GDPR compliance
          </p>
          <p className="text-sm text-muted-foreground">
            Cancel anytime • 30-day money-back guarantee • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
