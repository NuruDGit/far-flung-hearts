import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Heart, Users, Shield } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: TrendingUp,
      number: "87%",
      label: "Feel more connected",
      description: "Couples report stronger emotional bonds after 30 days"
    },
    {
      icon: Heart,
      number: "3x",
      label: "More quality time",
      description: "Time spent on meaningful conversations, not logistics"
    },
    {
      icon: Users,
      number: "10K+",
      label: "Couples thriving",
      description: "And growing every day across 50+ countries"
    },
    {
      icon: Shield,
      number: "100%",
      label: "Privacy first",
      description: "End-to-end encryption on all your intimate moments"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-accent to-love-deep relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Real results for real relationships
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Unlike dating apps that profit from your loneliness, we succeed when your relationship does.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 mb-4">
                  <stat.icon className="text-white" size={26} />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-white/70">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
