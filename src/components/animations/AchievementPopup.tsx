import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Heart, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AchievementPopupProps {
  show: boolean;
  title: string;
  description: string;
  icon?: 'trophy' | 'star' | 'heart' | 'flame';
  onClose?: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  show,
  title,
  description,
  icon = 'trophy',
  onClose,
}) => {
  const iconMap = {
    trophy: Trophy,
    star: Star,
    heart: Heart,
    flame: Flame,
  };

  const Icon = iconMap[icon];

  React.useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="bg-gradient-to-r from-primary/90 to-primary-glow/90 backdrop-blur-lg border-primary/20 shadow-elegant">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="p-4 flex items-center gap-4"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center"
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-semibold text-white"
                >
                  {title}
                </motion.h3>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-white/80"
                >
                  {description}
                </motion.p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5 }}
              >
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
