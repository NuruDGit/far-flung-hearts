import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Heart, Clock, Shield, Target, Brain, Video, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeatureSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Stay Present, Not Distant",
      description: "Real-time messaging that feels intimate. Reactions, voice notes, and media sharing that bridge any distance.",
      benefit: "Never feel disconnected",
      color: "primary"
    },
    {
      icon: Calendar,
      title: "Sync Lives, Not Just Schedules",
      description: "Smart calendar that respects time zones. Plan dates, remember anniversaries, and coordinate across continents.",
      benefit: "End scheduling confusion",
      color: "accent"
    },
    {
      icon: Heart,
      title: "Understand Each Other Deeply",
      description: "Track emotional patterns together. See when your partner needs support before they have to ask.",
      benefit: "Build emotional intelligence",
      color: "primary"
    },
    {
      icon: Target,
      title: "Grow Together, Not Apart",
      description: "Set relationship goals and track progress. From weekly check-ins to life milestones — achieve them together.",
      benefit: "Stay aligned on what matters",
      color: "accent"
    },
    {
      icon: Shield,
      title: "Your Love Story, Protected",
      description: "Encrypted memory vault for your most precious moments. Photos, messages, and memories — safe forever.",
      benefit: "Peace of mind guaranteed",
      color: "primary"
    },
    {
      icon: Brain,
      title: "AI That Actually Gets You",
      description: "Personalized relationship insights and advice from an AI trained on relationship science — not generic tips.",
      benefit: "Expert guidance on demand",
      color: "accent"
    },
    {
      icon: Clock,
      title: "Respect Both Your Worlds",
      description: "Intelligent notifications that know when you're both available. No more 3 AM messages or missed moments.",
      benefit: "Better timing, always",
      color: "primary"
    },
    {
      icon: Video,
      title: "Face Time That Feels Real",
      description: "Crystal-clear video calls built right in. No switching apps, no awkward links — just instant connection.",
      benefit: "One-tap intimacy",
      comingSoon: true,
      color: "accent"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            Features That Matter
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              nurture your relationship
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Dating apps got you together. Lobebo keeps you together. Tools designed by relationship experts to strengthen your bond every single day.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50 bg-background/50 backdrop-blur-sm relative overflow-hidden"
            >
              {feature.comingSoon && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                  feature.color === 'primary' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-accent/10 text-accent'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={26} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className={`text-xs font-medium ${
                  feature.color === 'primary' ? 'text-primary' : 'text-accent'
                }`}>
                  ✓ {feature.benefit}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            And we're just getting started.{" "}
            <a href="#pricing" className="text-primary font-medium hover:underline">
              See our roadmap →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
