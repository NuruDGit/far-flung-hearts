import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

interface ReadReceiptsProps {
  isSent: boolean;
  isDelivered: boolean;
  isRead: boolean;
}

export const ReadReceipts: React.FC<ReadReceiptsProps> = ({ isSent, isDelivered, isRead }) => {
  if (!isSent) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center"
    >
      {isRead ? (
        <motion.div
          initial={{ color: 'hsl(var(--muted-foreground))' }}
          animate={{ color: 'hsl(var(--primary))' }}
          transition={{ duration: 0.3 }}
        >
          <CheckCheck className="h-3 w-3" />
        </motion.div>
      ) : isDelivered ? (
        <CheckCheck className="h-3 w-3 text-muted-foreground" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground" />
      )}
    </motion.div>
  );
};
