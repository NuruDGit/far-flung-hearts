import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroCouple1 from "@/assets/hero-couple-1.jpg";
import heroCouple2 from "@/assets/hero-couple-2.jpg";
import heroCouple3 from "@/assets/hero-couple-3.jpg";

const rotatingWords = [
  { text: "deeper connection", color: "text-primary" },
  { text: "lasting intimacy", color: "text-accent" },
  { text: "emotional wellness", color: "text-love-deep" },
  { text: "stronger bond", color: "text-love-heart" },
];

const LoveHero = () => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-muted/20" />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center relative z-10 pt-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Relationship Fitness App</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                  Build your
                </h1>
                
                {/* Rotating Text */}
                <div className="h-14 sm:h-16 lg:h-20 xl:h-24 overflow-hidden">
                  <div 
                    className="transition-transform duration-700 ease-out"
                    style={{ transform: `translateY(-${currentWordIndex * 100}%)` }}
                  >
                    {rotatingWords.map((word, index) => (
                      <div 
                        key={index}
                        className={`h-14 sm:h-16 lg:h-20 xl:h-24 flex items-center justify-center lg:justify-start text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold ${word.color}`}
                      >
                        {word.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle - Pain point focused */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Dating apps help you find someone. <span className="text-foreground font-medium">Lobebo helps you keep them.</span> Track your emotional health, nurture your connection, and grow together — not apart.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  variant="love" 
                  size="lg" 
                  className="text-lg px-8 py-7 rounded-full font-medium group"
                  onClick={() => navigate('/auth')}
                >
                  Start Free Today
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-7 rounded-full font-medium border-2 hover:bg-secondary"
                  onClick={scrollToFeatures}
                >
                  <Play className="mr-2" size={18} />
                  See How It Works
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-3">
                  {[heroCouple1, heroCouple2, heroCouple3].map((img, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span> couples growing stronger together
                </div>
              </div>
            </div>

            {/* Right Content - Image Collage */}
            <div className="relative hidden lg:block">
              <div className="relative h-[600px]">
                {/* Main large image */}
                <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-3xl overflow-hidden shadow-2xl animate-fade-up">
                  <img 
                    src={heroCouple1} 
                    alt="Happy couple embracing" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Smaller overlapping image */}
                <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-3xl overflow-hidden shadow-xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  <img 
                    src={heroCouple3} 
                    alt="Couple sharing intimate moment" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating card */}
                <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-xl">💕</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Connection Score</p>
                      <p className="text-2xl font-bold text-primary">94%</p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
              </div>
            </div>

            {/* Mobile Image */}
            <div className="lg:hidden relative h-64 sm:h-80 rounded-3xl overflow-hidden">
              <img 
                src={heroCouple1} 
                alt="Happy couple embracing" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default LoveHero;
