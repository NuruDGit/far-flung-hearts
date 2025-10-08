import React from 'react';
import { motion } from 'framer-motion';

interface HeartLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeartLoader: React.FC<HeartLoaderProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.svg
        className={sizeClasses[size]}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
          className="text-primary"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </div>
  );
};

export const BrandedSpinner: React.FC<HeartLoaderProps> = ({ size = 'md', className }) => {
  const sizeMap = {
    sm: 24,
    md: 36,
    lg: 48,
  };

  const dimension = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        style={{ width: dimension, height: dimension }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            borderTopColor: 'hsl(var(--primary))',
            borderRightColor: 'transparent',
          }}
        />
        <motion.div
          className="absolute inset-2 flex items-center justify-center text-primary"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ❤️
        </motion.div>
      </motion.div>
    </div>
  );
};

export const DotsLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-primary"
          initial={{ y: 0 }}
          animate={{ y: [-8, 0, -8] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
