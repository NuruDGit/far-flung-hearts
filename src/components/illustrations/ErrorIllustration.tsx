import React from 'react';
import { motion } from 'framer-motion';

interface ErrorIllustrationProps {
  type: '404' | '500' | 'network' | 'permission' | 'empty';
  className?: string;
}

export const ErrorIllustration: React.FC<ErrorIllustrationProps> = ({ type, className }) => {
  const illustrations = {
    '404': (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d="M 70 80 Q 70 70 80 70 T 90 80"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.path
          d="M 110 80 Q 110 70 120 70 T 130 80"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.path
          d="M 70 120 Q 100 140 130 120"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />
      </svg>
    ),
    '500': (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="50"
          y="50"
          width="100"
          height="100"
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="2"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.line
          x1="70"
          y1="70"
          x2="130"
          y2="130"
          stroke="hsl(var(--destructive))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.line
          x1="130"
          y1="70"
          x2="70"
          y2="130"
          stroke="hsl(var(--destructive))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
      </svg>
    ),
    network: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M 100 40 L 100 80"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    ),
    permission: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="70"
          y="90"
          width="60"
          height="70"
          rx="5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <motion.path
          d="M 70 90 L 70 70 Q 70 50 100 50 Q 130 50 130 70 L 130 90"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx="100"
          cy="120"
          r="8"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        />
      </svg>
    ),
    empty: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="50"
          y="80"
          width="100"
          height="80"
          rx="5"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.path
          d="M 80 110 L 90 120 L 110 100"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        />
      </svg>
    ),
  };

  return illustrations[type];
};
