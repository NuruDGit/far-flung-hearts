import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  lines?: number;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  className,
  variant = 'rectangular',
  lines = 1,
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer rounded',
              i === lines - 1 && 'w-3/4',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'h-4 rounded',
        className
      )}
    />
  );
};

interface ContentLoaderProps {
  type: 'message' | 'card' | 'profile' | 'image' | 'list';
  count?: number;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({ type, count = 1 }) => {
  const renderLoader = () => {
    switch (type) {
      case 'message':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className={cn('flex gap-3', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                <ShimmerSkeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2 max-w-[70%]">
                  <ShimmerSkeleton className="h-16" />
                  <ShimmerSkeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <ShimmerSkeleton className="h-5 w-32" />
                  <ShimmerSkeleton className="h-4 w-16" />
                </div>
                <ShimmerSkeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <ShimmerSkeleton className="h-6 w-20" />
                  <ShimmerSkeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ShimmerSkeleton variant="circular" className="w-24 h-24" />
              <div className="flex-1 space-y-2">
                <ShimmerSkeleton className="h-6 w-32" />
                <ShimmerSkeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-3">
              <ShimmerSkeleton className="h-10 w-full" />
              <ShimmerSkeleton className="h-10 w-full" />
              <ShimmerSkeleton className="h-24 w-full" />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <ShimmerSkeleton key={i} className="aspect-square" />
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <ShimmerSkeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton className="h-4 w-full" />
                  <ShimmerSkeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <ShimmerSkeleton />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {renderLoader()}
    </motion.div>
  );
};
