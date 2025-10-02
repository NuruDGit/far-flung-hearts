import { Button } from "@/components/ui/button";
import { Heart, Calendar, MessageCircle, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const LoveHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 love-gradient-soft animate-gradient-move"></div>
      
      {/* Floating hearts and particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated floating hearts */}
        <Heart className="absolute top-20 left-20 text-love-heart animate-float opacity-30" size={24} />
        <Heart className="absolute top-32 right-32 text-love-deep animate-pulse-love opacity-40" size={16} />
        <Heart className="absolute bottom-40 left-40 text-love-coral animate-heartbeat opacity-50" size={20} />
        <Heart className="absolute bottom-20 right-20 text-love-heart animate-float opacity-35" size={18} />
        
        {/* Floating particles */}
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-love-heart/30 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-love-coral/40 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-love-deep/20 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-love-heart/35 rounded-full animate-float"></div>
        
        {/* Subtle light orbs */}
        <div className="absolute top-1/2 left-10 w-8 h-8 bg-love-glow/20 rounded-full blur-sm animate-pulse-glow"></div>
        <div className="absolute bottom-1/3 right-10 w-6 h-6 bg-love-heart/15 rounded-full blur-md animate-float-glow"></div>
      </div>

      <div className="container mx-auto px-6 pt-24 md:pt-32 pb-24 md:pb-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent leading-tight">
                Stay Connected Across Any Distance
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg text-center lg:text-left mx-auto lg:mx-0">
                Real-time messaging, shared calendar, mood tracking, and AI-powered relationship advice. Everything you need to keep your love strong.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="love" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Start Free Today
                <Heart className="ml-2" size={20} />
              </Button>
              <Button 
                variant="loveOutline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {[
                { icon: MessageCircle, label: "Real-time Chat" },
                { icon: Calendar, label: "Shared Calendar" },
                { icon: Heart, label: "Mood Tracking" },
                { icon: Gift, label: "Memory Vault" }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/50 backdrop-blur-sm hover-scale transition-all hover:bg-white/70 cursor-pointer group">
                  <feature.icon className="text-love-heart group-hover:text-love-deep transition-colors" size={24} />
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
              <div className="absolute inset-0 bg-gradient-to-t from-love-heart/20 to-transparent mb-8"></div>
            </div>
            
            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-card animate-float hover-scale cursor-pointer">
              <Heart className="text-love-heart animate-heartbeat hover:text-love-deep transition-colors" size={32} />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-card">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
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