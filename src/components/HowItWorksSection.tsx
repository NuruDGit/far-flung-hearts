import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Link2, Sparkles, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorksSection = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Space",
      description: "Set up your profile in 60 seconds. Add what makes your relationship unique — love languages, important dates, and shared interests.",
      step: "01"
    },
    {
      icon: Link2,
      title: "Invite Your Partner",
      description: "Send a secure invite link. When they join, your shared space activates — synced calendars, shared goals, and your private memory vault.",
      step: "02"
    },
    {
      icon: Sparkles,
      title: "Build Your Rituals",
      description: "Set up daily check-ins, weekly date reminders, and monthly relationship reviews. Small habits that create lasting connection.",
      step: "03"
    },
    {
      icon: TrendingUp,
      title: "Watch Yourselves Grow",
      description: "Track your relationship health over time. Celebrate wins, work through challenges, and see your bond strengthen month after month.",
      step: "04"
    }
  ];

  const benefits = [
    "No credit card required to start",
    "Full access for 14 days free",
    "Cancel anytime, keep your memories"
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm tracking-wide uppercase mb-4 block">
            Simple Setup
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            From download to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              "I love this"
            </span>{" "}
            in minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            No complicated setup. No learning curve. Just you, your partner, and tools that actually help.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <Card className="h-full border-border/50 bg-background hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <step.icon className="text-primary" size={24} />
                    </div>
                    <span className="text-4xl font-display font-bold text-muted/20">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-accent/50 transform -translate-y-1/2 z-10" />
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Ready to strengthen your relationship?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of couples who chose to invest in their love — not just find it.
              </p>
              
              {/* Benefits list */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant="love" 
                size="lg" 
                className="text-lg px-10 py-7 rounded-full group"
                onClick={() => navigate('/auth')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
