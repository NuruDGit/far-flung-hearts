import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Zap, Camera, LucideIcon } from "lucide-react";

interface QuickActionsProps {
  pair: any;
  onSendLove: () => void;
  onSendPing: () => void;
  onSharePhoto: () => void;
}

interface QuickAction {
  icon: LucideIcon;
  label: string;
  action: () => void;
  gradient: string;
}

export const QuickActions = ({ pair, onSendLove, onSendPing, onSharePhoto }: QuickActionsProps) => {
  const quickActions: QuickAction[] = [
    {
      icon: Heart,
      label: "Send Love",
      action: onSendLove,
      gradient: "bg-gradient-to-br from-love-heart to-love-deep"
    },
    {
      icon: Zap,
      label: "Quick Ping",
      action: onSendPing,
      gradient: "bg-gradient-to-br from-love-coral to-love-heart"
    },
    {
      icon: Camera,
      label: "Share Moment",
      action: onSharePhoto,
      gradient: "bg-gradient-to-br from-love-deep to-love-heart"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300
      }
    }
  };

  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {quickActions.map((action, index) => (
        <motion.div key={index} variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring" as const, stiffness: 400 }}
          >
            <Card 
              className={`cursor-pointer overflow-hidden group ${!pair ? 'opacity-50' : ''}`}
              onClick={pair ? action.action : () => {}}
            >
              <CardContent className="p-6 text-center relative">
                {/* Ripple effect background */}
                <motion.div
                  className="absolute inset-0 bg-love-heart/10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 2, opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.6 }}
                />

                <motion.div 
                  className={`w-14 h-14 rounded-full ${action.gradient} flex items-center justify-center mx-auto mb-3 shadow-glow-sm group-hover:shadow-glow transition-shadow`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <action.icon className="text-white" size={24} />
                </motion.div>
                
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                {!pair && (
                  <p className="text-xs text-muted-foreground mt-1">Pair to unlock</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
