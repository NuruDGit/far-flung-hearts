import { Button } from "@/components/ui/button";
import { Heart, Calendar, MessageCircle, Gift } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const LoveHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 love-gradient-soft"></div>
      
      {/* Floating hearts animation */}
      <div className="absolute inset-0 pointer-events-none">
        <Heart className="absolute top-20 left-20 text-love-heart animate-float opacity-30" size={24} />
        <Heart className="absolute top-32 right-32 text-love-deep animate-pulse-love opacity-40" size={16} />
        <Heart className="absolute bottom-40 left-40 text-love-coral animate-heartbeat opacity-50" size={20} />
        <Heart className="absolute bottom-20 right-20 text-love-heart animate-float opacity-35" size={18} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent leading-tight">
                Keep Your Love Story Alive
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Bridge the distance with your special someone. Stay connected, share moments, and count down to your next reunion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="love" size="lg" className="text-lg px-8 py-6">
                Start Your Journey
                <Heart className="ml-2" size={20} />
              </Button>
              <Button variant="loveOutline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {[
                { icon: MessageCircle, label: "Real-time Chat" },
                { icon: Calendar, label: "Shared Calendar" },
                { icon: Heart, label: "Daily Questions" },
                { icon: Gift, label: "Gift Exchange" }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/50 backdrop-blur-sm">
                  <feature.icon className="text-love-heart" size={24} />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-love">
              <img 
                src={heroImage} 
                alt="Couple connecting across distance" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-love-heart/20 to-transparent"></div>
            </div>
            
            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-card animate-float">
              <Heart className="text-love-heart animate-heartbeat" size={32} />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-card">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoveHero;