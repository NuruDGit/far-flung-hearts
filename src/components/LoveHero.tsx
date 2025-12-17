import { Button } from "@/components/ui/button";
import { Heart, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-image.jpg";

const rotatingWords = [
  { text: "long distance love", color: "text-love-heart" },
  { text: "deep connection", color: "text-love-coral" },
  { text: "shared moments", color: "text-love-deep" },
  { text: "lasting bonds", color: "text-primary" },
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
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 relative z-10">
        {/* Centered Headline - Pinterest Style */}
        <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
            Get your next
          </h1>
          
          {/* Rotating Text - Pinterest Inspired */}
          <div className="h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden">
            <div 
              className="transition-transform duration-700 ease-in-out"
              style={{ transform: `translateY(-${currentWordIndex * 100}%)` }}
            >
              {rotatingWords.map((word, index) => (
                <div 
                  key={index}
                  className={`h-16 sm:h-20 md:h-24 lg:h-28 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold ${word.color}`}
                >
                  {word.text}
                </div>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Real-time messaging, shared calendars, mood tracking, and AI-powered relationship advice — everything you need to keep your love strong.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 opacity-0 animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <Button 
              variant="love" 
              size="lg" 
              className="text-lg px-10 py-7 rounded-full font-medium"
              onClick={() => navigate('/auth')}
            >
              Start Free Today
              <Heart className="ml-2" size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-7 rounded-full font-medium border-2"
              onClick={scrollToFeatures}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-love-heart/10 hover:bg-love-heart/20 flex items-center justify-center transition-all duration-300 animate-float cursor-pointer"
        >
          <ArrowDown className="text-love-heart" size={24} />
        </button>
      </div>

      {/* Pinterest-style Masonry Images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left side images */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] hidden lg:flex flex-col gap-4 p-4 opacity-60">
          <div className="w-full h-48 rounded-2xl bg-love-peach/30 animate-float" style={{ animationDelay: '0s' }} />
          <div className="w-full h-64 rounded-2xl overflow-hidden animate-float" style={{ animationDelay: '0.5s' }}>
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-70" />
          </div>
          <div className="w-full h-40 rounded-2xl bg-love-coral/20 animate-float" style={{ animationDelay: '1s' }} />
          <div className="w-full h-56 rounded-2xl bg-love-heart/15 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Left-center images */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[12%] hidden xl:flex flex-col gap-4 p-4 pt-20 opacity-50">
          <div className="w-full h-56 rounded-2xl bg-love-deep/20 animate-float" style={{ animationDelay: '0.3s' }} />
          <div className="w-full h-72 rounded-2xl bg-love-peach/40 animate-float" style={{ animationDelay: '0.8s' }} />
          <div className="w-full h-48 rounded-2xl bg-love-coral/25 animate-float" style={{ animationDelay: '1.3s' }} />
        </div>

        {/* Right-center images */}
        <div className="absolute right-[15%] top-0 bottom-0 w-[12%] hidden xl:flex flex-col gap-4 p-4 pt-32 opacity-50">
          <div className="w-full h-64 rounded-2xl bg-love-coral/30 animate-float" style={{ animationDelay: '0.2s' }} />
          <div className="w-full h-48 rounded-2xl bg-love-heart/20 animate-float" style={{ animationDelay: '0.7s' }} />
          <div className="w-full h-60 rounded-2xl bg-love-peach/35 animate-float" style={{ animationDelay: '1.2s' }} />
        </div>

        {/* Right side images */}
        <div className="absolute right-0 top-0 bottom-0 w-[15%] hidden lg:flex flex-col gap-4 p-4 pt-16 opacity-60">
          <div className="w-full h-52 rounded-2xl bg-love-heart/25 animate-float" style={{ animationDelay: '0.4s' }} />
          <div className="w-full h-40 rounded-2xl bg-love-deep/15 animate-float" style={{ animationDelay: '0.9s' }} />
          <div className="w-full h-68 rounded-2xl overflow-hidden animate-float" style={{ animationDelay: '1.4s' }}>
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-60" />
          </div>
          <div className="w-full h-44 rounded-2xl bg-love-coral/20 animate-float" style={{ animationDelay: '1.9s' }} />
        </div>

        {/* Subtle gradient overlays for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
};

export default LoveHero;
