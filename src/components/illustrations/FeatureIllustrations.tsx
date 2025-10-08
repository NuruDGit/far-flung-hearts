import React from 'react';
import { motion } from 'framer-motion';

export const OnboardingIllustration: React.FC<{ step: number; className?: string }> = ({
  step,
  className,
}) => {
  const illustrations = [
    // Step 1: Create Account
    <svg viewBox="0 0 200 200" className={className} key="step1">
      <motion.circle
        cx="100"
        cy="80"
        r="30"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.path
        d="M 60 140 Q 100 180 140 140"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </svg>,

    // Step 2: Connect Partner
    <svg viewBox="0 0 200 200" className={className} key="step2">
      <motion.circle
        cx="70"
        cy="100"
        r="25"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      />
      <motion.circle
        cx="130"
        cy="100"
        r="25"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      />
      <motion.path
        d="M 95 100 L 105 100"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />
      <motion.path
        d="M 95 95 L 100 100 L 95 105"
        fill="hsl(var(--primary))"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      />
    </svg>,

    // Step 3: Start Journey
    <svg viewBox="0 0 200 200" className={className} key="step3">
      <motion.path
        d="M 100 50 L 100 150"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      {[60, 100, 140].map((y, i) => (
        <motion.circle
          key={i}
          cx="100"
          cy={y}
          r="8"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.3, type: 'spring' }}
        />
      ))}
    </svg>,
  ];

  return illustrations[step] || null;
};

export const FeatureExplainerIllustration: React.FC<{
  feature: 'messages' | 'calendar' | 'memories' | 'goals';
  className?: string;
}> = ({ feature, className }) => {
  const illustrations = {
    messages: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="40"
          y="60"
          width="120"
          height="80"
          rx="10"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.line
          x1="60"
          y1="80"
          x2="100"
          y2="80"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.line
          x1="60"
          y1="100"
          x2="130"
          y2="100"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        />
        <motion.line
          x1="60"
          y1="120"
          x2="110"
          y2="120"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="50"
          y="60"
          width="100"
          height="90"
          rx="5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.line
          x1="50"
          y1="80"
          x2="150"
          y2="80"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <motion.circle
              key={`${row}-${col}`}
              cx={70 + col * 20}
              cy={100 + row * 20}
              r="3"
              fill="hsl(var(--primary))"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + (row * 3 + col) * 0.1, type: 'spring' }}
            />
          ))
        )}
      </svg>
    ),
    memories: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.rect
          x="60"
          y="60"
          width="80"
          height="80"
          rx="5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx="85"
          cy="90"
          r="8"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        />
        <motion.path
          d="M 70 120 L 90 100 L 110 115 L 130 95"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />
      </svg>
    ),
    goals: (
      <svg viewBox="0 0 200 200" className={className}>
        <motion.circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d="M 80 100 L 95 115 L 120 85"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </svg>
    ),
  };

  return illustrations[feature];
};
