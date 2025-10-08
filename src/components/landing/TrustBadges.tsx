import { motion } from "framer-motion";
import { Star, Users, Shield } from "lucide-react";

export const TrustBadges = () => {
  const badges = [
    {
      icon: Star,
      text: "4.9 Rating",
      subtext: "From 500+ reviews"
    },
    {
      icon: Users,
      text: "Active Users",
      subtext: "Growing daily"
    },
    {
      icon: Shield,
      text: "Secure & Private",
      subtext: "End-to-end encrypted"
    }
  ];

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-6 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-3 px-6 py-3 rounded-full glass-subtle shadow-elevation-2"
          whileHover={{ scale: 1.05, boxShadow: "var(--shadow-elevation-3)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <badge.icon className="w-5 h-5 text-love-heart" />
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">{badge.text}</div>
            <div className="text-xs text-muted-foreground">{badge.subtext}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
