import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineValidationProps {
  status?: 'success' | 'error' | 'loading';
  message?: string;
  show?: boolean;
}

export const InlineValidation: React.FC<InlineValidationProps> = ({
  status,
  message,
  show = true,
}) => {
  if (!show || !status) return null;

  const statusConfig = {
    success: {
      icon: CheckCircle,
      className: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      className: 'text-destructive',
    },
    loading: {
      icon: Loader2,
      className: 'text-muted-foreground animate-spin',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 mt-1"
      >
        <Icon className={cn('w-4 h-4', config.className)} />
        {message && (
          <span className={cn('text-sm', config.className)}>
            {message}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
