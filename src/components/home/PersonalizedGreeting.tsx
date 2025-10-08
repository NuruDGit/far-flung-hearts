import React from "react";
import { motion } from "framer-motion";

interface PersonalizedGreetingProps {
  userName: string;
}

export const PersonalizedGreeting = ({ userName }: PersonalizedGreetingProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getGradient = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "from-indigo-900 via-purple-900 to-pink-900"; // Night
    if (hour < 12) return "from-orange-400 via-pink-400 to-yellow-300"; // Morning - sunrise
    if (hour < 17) return "from-sky-400 via-blue-300 to-cyan-200"; // Afternoon
    if (hour < 20) return "from-orange-500 via-red-500 to-pink-600"; // Evening - sunset
    return "from-indigo-900 via-purple-900 to-pink-900"; // Night
  };

  return (
    <motion.div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${getGradient()} shadow-elevation-4 overflow-hidden mb-6`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: "100%",
            }}
            animate={{
              y: "-20%",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.h1
          className="text-3xl md:text-4xl font-display font-bold text-white mb-2 text-shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {getGreeting()}, {userName}!
        </motion.h1>
        <motion.p
          className="text-white/90 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Ready to strengthen your connection today?
        </motion.p>
      </div>
    </motion.div>
  );
};
