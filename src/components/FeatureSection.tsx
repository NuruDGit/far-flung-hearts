import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, HelpCircle, Clock, Vault, Globe, Target, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeatureSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Real-Time Messaging",
      description: "Chat with your partner instantly with message reactions, replies, and media sharing.",
      color: "love-heart"
    },
    {
      icon: Calendar,
      title: "Shared Calendar",
      description: "Sync your schedules across time zones and never miss a special moment together.",
      color: "love-deep"
    },
    {
      icon: HelpCircle,
      title: "Mood Tracking",
      description: "Track your emotional journey together with insights and partner support features.",
      color: "love-coral"
    },
    {
      icon: Target,
      title: "Goals & Tasks",
      description: "Set and achieve relationship goals together with shared task management.",
      color: "love-heart"
    },
    {
      icon: Vault,
      title: "Memory Vault",
      description: "Securely store your precious photos and messages in an encrypted vault.",
      color: "love-deep"
    },
    {
      icon: Brain,
      title: "AI Love Advisor",
      description: "Get personalized relationship advice and book recommendations powered by AI.",
      color: "love-coral"
    },
    {
      icon: Globe,
      title: "Timezone Intelligence",
      description: "Smart notifications that respect both your schedules and time zones.",
      color: "love-heart"
    },
    {
      icon: Clock,
      title: "Video Calling",
      description: "Connect face-to-face with high-quality video calls right from the app.",
      color: "love-deep",
      comingSoon: true
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-love-peach/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent mb-4">
            Everything You Need to Stay Connected
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive suite of features is designed specifically for long-distance couples
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const getIconBgClass = (color: string) => {
              switch(color) {
                case 'love-heart':
                  return 'bg-gradient-to-br from-love-heart to-love-heart/70';
                case 'love-deep':
                  return 'bg-gradient-to-br from-love-deep to-love-deep/70';
                case 'love-coral':
                  return 'bg-gradient-to-br from-love-coral to-love-coral/70';
                default:
                  return 'bg-gradient-to-br from-love-heart to-love-heart/70';
              }
            };

            return (
              <Card key={index} className="group hover:shadow-love transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm relative">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getIconBgClass(feature.color)} mb-4 group-hover:animate-heartbeat`}>
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    {feature.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;