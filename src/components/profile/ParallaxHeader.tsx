import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeaderProps {
  imageUrl?: string;
  title: string;
  subtitle?: string;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  imageUrl,
  title,
  subtitle,
}) => {
  const { scrollY } = useScroll();
  const [scrollPosition, setScrollPosition] = useState(0);

  const y = useTransform(scrollY, [0, 300], [0, 150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 200], [1, 1.1]);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', setScrollPosition);
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col justify-end p-6"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90 drop-shadow mt-2"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};
