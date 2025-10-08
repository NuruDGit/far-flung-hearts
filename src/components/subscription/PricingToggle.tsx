import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export const PricingToggle: React.FC<PricingToggleProps> = ({
  isAnnual,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={cn(
        "text-sm font-medium transition-colors",
        !isAnnual ? "text-foreground" : "text-muted-foreground"
      )}>
        Monthly
      </span>

      <button
        onClick={() => onToggle(!isAnnual)}
        className="relative w-14 h-7 rounded-full bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-primary shadow-elevation-2"
          animate={{
            left: isAnnual ? 'calc(100% - 1.75rem)' : '0.125rem',
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
      </button>

      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium transition-colors",
          isAnnual ? "text-foreground" : "text-muted-foreground"
        )}>
          Annual
        </span>
        <Badge variant="secondary" className="bg-success/10 text-success">
          Save 20%
        </Badge>
      </div>
    </div>
  );
};
