import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDistance?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDistance = 80,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const touchStartY = useRef(0);
  const controls = useAnimation();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const delta = touchY - touchStartY.current;

    if (delta > 0 && window.scrollY === 0) {
      setIsPulling(true);
      const offset = Math.min(delta * 0.5, pullDistance);
      setPullOffset(offset);
      controls.start({ rotate: offset * 3 });
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullOffset >= pullDistance) {
      setIsRefreshing(true);
      controls.start({ rotate: 360, transition: { duration: 0.5, repeat: Infinity, ease: 'linear' } });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullOffset(0);
        controls.start({ rotate: 0 });
      }
    } else {
      setPullOffset(0);
      controls.start({ rotate: 0 });
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isPulling || isRefreshing ? pullOffset : 0,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div animate={controls} className="text-primary">
          <RefreshCw className="w-6 h-6" />
        </motion.div>
      </motion.div>
      
      <motion.div
        animate={{ y: isPulling || isRefreshing ? pullOffset : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
