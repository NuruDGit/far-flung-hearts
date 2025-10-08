import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 border rounded-lg bg-muted/30"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4 text-primary" />
        Quiet Hours
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time" className="text-xs text-muted-foreground">
            Start Time
          </Label>
          <div className="relative">
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="pr-10"
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-time" className="text-xs text-muted-foreground">
            End Time
          </Label>
          <div className="relative">
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="pr-10"
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        className="h-2 bg-primary/20 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        Notifications muted from {startTime} to {endTime}
      </p>
    </motion.div>
  );
};
