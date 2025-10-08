import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Link2, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorksSection = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Sign up individually and add your personal details, preferences, and love language.",
      step: "01"
    },
    {
      icon: Link2,
      title: "Connect With Your Partner",
      description: "Link your profiles using a secure QR code and verify your relationship.",
      step: "02"
    },
    {
      icon: Calendar,
      title: "Sync Your Lives",
      description: "Connect calendars, set time zones, and establish your communication preferences.",
      step: "03"
    },
    {
      icon: Heart,
      title: "Start Your Journey",
      description: "Begin messaging, share memories, track moods together, and get AI-powered relationship advice.",
      step: "04"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent mb-6">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl font-sans font-normal text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Getting started is easy. Follow these simple steps to begin your love journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full hover:shadow-love transition-all duration-300 hover:-translate-y-1 border-love-coral/20">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <div className="love-gradient-soft rounded-full p-4 inline-flex items-center justify-center mb-4">
                      <step.icon className="text-love-heart" size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-love-heart text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-sans font-semibold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-base font-sans font-normal text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-love-heart to-love-deep transform -translate-y-1/2 z-10">
                  <Heart className="absolute -right-2 -top-2 text-love-heart" size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="love" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Start Your Love Story Today
            <Heart className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;