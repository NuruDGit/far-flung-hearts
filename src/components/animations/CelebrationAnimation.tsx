import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationAnimationProps {
  type: 'streak' | 'message' | 'upload' | 'goal' | 'anniversary';
  show: boolean;
  onComplete?: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type,
  show,
  onComplete,
}) => {
  useEffect(() => {
    if (!show) return;

    const celebrate = async () => {
      switch (type) {
        case 'streak':
          await streakCelebration();
          break;
        case 'message':
          await messageCelebration();
          break;
        case 'upload':
          await uploadCelebration();
          break;
        case 'goal':
          await goalCelebration();
          break;
        case 'anniversary':
          await anniversaryCelebration();
          break;
      }

      setTimeout(() => {
        onComplete?.();
      }, 3000);
    };

    celebrate();
  }, [show, type, onComplete]);

  const streakCelebration = async () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B9D', '#C084FC', '#60A5FA'],
    });

    // Play sound if available
    playSound('celebration');
  };

  const messageCelebration = async () => {
    const scalar = 2;
    const heart = confetti.shapeFromText({ text: '💕', scalar });

    confetti({
      shapes: [heart],
      particleCount: 30,
      spread: 100,
      origin: { y: 0.7 },
      gravity: 0.8,
      ticks: 300,
    });
  };

  const uploadCelebration = async () => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10B981', '#34D399'],
    });

    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10B981', '#34D399'],
    });
  };

  const goalCelebration = async () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500'],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
    playSound('achievement');
  };

  const anniversaryCelebration = async () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    playSound('fireworks');
  };

  const playSound = (soundType: string) => {
    // Implement sound playback here
    // You would need to add audio files to your project
    try {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    } catch (error) {
      // Audio not available
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {type === 'message' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-6xl"
        >
          💕
        </motion.div>
      )}

      {type === 'upload' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 0.6 }}
          className="text-6xl"
        >
          ✓
        </motion.div>
      )}

      {type === 'goal' && (
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: [0, 1.2, 1], y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-7xl"
        >
          🏆
        </motion.div>
      )}
    </motion.div>
  );
};
