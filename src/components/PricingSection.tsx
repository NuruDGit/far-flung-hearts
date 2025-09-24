import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Heart, Crown, Sparkles } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Heart,
      description: "Perfect for getting started",
      features: [
        "Unlimited texting",
        "One daily game",
        "Single calendar sync",
        "Basic profile features",
        "Community support"
      ],
      buttonText: "Get Started Free",
      popular: false,
      variant: "loveOutline" as const
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      icon: Crown,
      description: "Everything you need for love",
      features: [
        "Everything in Free",
        "Multi-device sync",
        "Joint streaming",
        "Advanced games",
        "Priority support",
        "Gift marketplace access",
        "Custom stickers & themes",
        "Weekly relationship insights"
      ],
      buttonText: "Upgrade to Premium",
      popular: true,
      variant: "love" as const
    },
    {
      name: "Super Premium",
      price: "$19.99",
      period: "month",
      icon: Sparkles,
      description: "The ultimate love experience",
      features: [
        "Everything in Premium",
        "Quarterly gift boxes",
        "Travel concierge service",
        "Personal relationship coach",
        "Exclusive couple events",
        "Priority gift delivery",
        "Custom app themes",
        "24/7 premium support"
      ],
      buttonText: "Go Super Premium",
      popular: false,
      variant: "love" as const
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-background to-love-peach/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent mb-4">
            Choose Your Love Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready for more features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative hover:shadow-love transition-all duration-300 ${plan.popular ? 'ring-2 ring-love-heart transform scale-105' : ''} border-love-coral/20`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="love-gradient text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto ${plan.popular ? 'love-gradient' : 'love-gradient-soft'} mb-4`}>
                  <plan.icon className="text-white" size={28} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <div className="text-4xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                  {plan.price}
                  <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="text-love-heart flex-shrink-0" size={16} />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant={plan.variant} className="w-full">
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include end-to-end encryption and GDPR compliance
          </p>
          <p className="text-sm text-muted-foreground">
            Cancel anytime • 30-day money-back guarantee • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;