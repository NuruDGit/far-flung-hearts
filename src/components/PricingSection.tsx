import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Heart, Crown, Sparkles, Shield, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { STRIPE_CONFIG } from "@/config/stripe";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "./landing/FAQSection";

const PricingSection = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handleCheckout = async (priceId: string | null, tierName: string) => {
    if (!priceId) {
      if (!user) {
        navigate('/auth');
      } else {
        toast({
          title: "You're on the Free plan",
          description: "You're already using the free tier!",
        });
      }
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade your plan",
      });
      navigate('/auth');
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
        window.open(data.url, '_blank');
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
        "Basic messaging",
        "Shared calendar",
        "Daily questions",
        "Limited mood tracking",
        "5 memory vault photos"
      ],
      priceId: null,
      tierKey: 'free' as const,
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Premium Monthly",
      price: "$4.99",
      period: "month",
      icon: Crown,
      description: "Everything you need",
      features: [
        "Unlimited messaging",
        "Advanced calendar features",
        "Unlimited daily questions",
        "Full mood tracking & analytics",
        "Unlimited memory vault",
        "AI Love Advisor",
        "Video & voice calls",
        "Priority support"
      ],
      priceId: STRIPE_CONFIG.premium_monthly.price_id,
      tierKey: 'premium_monthly' as const,
      buttonText: "Upgrade to Premium",
      popular: false
    },
    {
      name: "Premium Annual",
      price: "$49.99",
      period: "year",
      icon: Sparkles,
      description: "Best value - Save 17%",
      features: [
        "All Premium Monthly features",
        "Save $10 per year",
        "Exclusive anniversary features",
        "Early access to new features",
        "Extended storage",
        "VIP support"
      ],
      priceId: STRIPE_CONFIG.premium_annual.price_id,
      tierKey: 'premium_annual' as const,
      buttonText: "Get Annual Plan",
      popular: true
    }
  ];

  const displayedPlans = billingPeriod === 'monthly' 
    ? plans.filter(p => p.tierKey !== 'premium_annual')
    : plans.filter(p => p.tierKey !== 'premium_monthly');

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl md:text-2xl font-sans font-normal text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Start free, upgrade anytime. No hidden fees, cancel whenever you want.
          </p>

          {/* Billing Toggle */}
          <motion.div 
            className="inline-flex items-center gap-3 p-1 bg-muted rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-8 py-3 rounded-full font-sans font-semibold transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-love-heart text-white shadow-elevation-3'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-8 py-3 rounded-full font-sans font-semibold transition-all duration-300 flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-love-heart text-white shadow-elevation-3'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <Badge className="bg-success text-success-foreground font-semibold">Save 17%</Badge>
            </button>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {displayedPlans.map((plan, index) => {
            const Icon = plan.icon;
            const isActive = isCurrentPlan(plan.tierKey);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={`relative h-full ${
                    plan.popular 
                      ? 'border-love-heart border-2 shadow-glow' 
                      : 'border-border shadow-elevation-2 hover:shadow-elevation-4'
                  } transition-all bg-card/80 backdrop-blur-sm`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-love-heart text-white shadow-elevation-3 px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8 pt-8">
                      <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-love-coral to-love-heart rounded-2xl flex items-center justify-center shadow-glow-sm">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-display font-bold">{plan.name}</CardTitle>
                      <p className="text-base font-sans font-medium text-muted-foreground mt-2">{plan.description}</p>
                      <div className="mt-6">
                        <span className="text-5xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + (idx * 0.05) }}
                          >
                            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-base font-sans font-normal text-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.popular ? "love" : "loveOutline"}
                        size="lg"
                        disabled={isActive || loading === plan.name}
                        onClick={() => handleCheckout(plan.priceId, plan.name)}
                      >
                        {loading === plan.name ? (
                          "Processing..."
                        ) : isActive ? (
                          "Current Plan"
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">End-to-end Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BadgeCheck className="w-5 h-5 text-info" />
            <span className="text-sm font-medium">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-5 h-5 text-love-heart" />
            <span className="text-sm font-medium">Cancel Anytime</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </section>
  );
};

export default PricingSection;
