import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Globe, MessageCircle } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "14M+",
      label: "Long-distance couples worldwide",
      description: "Growing every day"
    },
    {
      icon: Globe,
      number: "195",
      label: "Countries connected",
      description: "Love knows no borders"
    },
    {
      icon: MessageCircle,
      number: "1M+",
      label: "Messages translated daily",
      description: "Breaking language barriers"
    },
    {
      icon: Heart,
      number: "85%",
      label: "Couples stay together longer",
      description: "With our platform"
    }
  ];

  return (
    <section className="py-20 love-gradient">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Bringing the World Together
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join millions of couples strengthening their long-distance relationships across continents
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  <stat.icon className="text-white" size={28} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-white/80">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;