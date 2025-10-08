import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MessageCircle, Gift, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrustBadges } from "./landing/TrustBadges";

const LoveHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background with gradient */}
      <motion.div 
        className="absolute inset-0 love-gradient-soft"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Animated floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0.3, 0.6, 0],
              scale: [1, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <Heart className="text-love-heart" size={16 + Math.random() * 16} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div 
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent leading-tight text-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Stay Connected Across Any Distance
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Real-time messaging, shared calendar, mood tracking, and AI-powered relationship advice. Everything you need to keep your love strong.
              </motion.p>
            </div>

            {/* Statistics */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                  <AnimatedCounter end={1000} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">Active Couples</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                  <AnimatedCounter end={4} suffix=".9" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">App Rating</div>
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="love" 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-glow hover:shadow-glow-sm transition-all"
                  onClick={() => navigate('/auth')}
                >
                  Start Free Today
                  <Heart className="ml-2" size={20} />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="loveOutline" 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-elevation-2"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </motion.div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {[
                { icon: MessageCircle, label: "Real-time Chat" },
                { icon: Calendar, label: "Shared Calendar" },
                { icon: Heart, label: "Mood Tracking" },
                { icon: Gift, label: "Memory Vault" }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl glass-subtle hover:glass-medium transition-all cursor-pointer group shadow-elevation-1 hover:shadow-elevation-3"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + (index * 0.1), duration: 0.5 }}
                >
                  <feature.icon className="text-love-heart group-hover:text-love-deep transition-colors" size={28} />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="relative rounded-3xl overflow-hidden shadow-elevation-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={heroImage} 
                alt="Couple connecting across distance" 
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-love-heart/20 to-transparent"></div>
            </motion.div>
            
            {/* Floating UI elements */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-elevation-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="text-love-heart animate-heartbeat" size={32} />
            </motion.div>
            <motion.div 
              className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-elevation-4 glass-subtle"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Connected</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <TrustBadges />
      </div>
    </section>
  );
};

export default LoveHero;
