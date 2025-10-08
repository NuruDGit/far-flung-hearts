import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Clock, MapPin, Edit, Trash2, Heart, Gift, Plane, Cake, Coffee, Home, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  kind: string;
  meta: any;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const eventTypeConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  date: { icon: Heart, color: 'text-primary', label: 'Date Night' },
  anniversary: { icon: Gift, color: 'text-accent-foreground', label: 'Anniversary' },
  travel: { icon: Plane, color: 'text-primary', label: 'Travel' },
  birthday: { icon: Cake, color: 'text-secondary-foreground', label: 'Birthday' },
  home: { icon: Home, color: 'text-muted-foreground', label: 'Cozy Night' },
  coffee: { icon: Coffee, color: 'text-accent-foreground', label: 'Coffee Date' },
};

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  starts_at,
  ends_at,
  all_day,
  kind,
  meta,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const config = eventTypeConfig[kind] || eventTypeConfig.date;
  const Icon = config.icon;
  const confirmed = meta?.confirmed ?? false;

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -100) {
      // Swiped left - show delete
      setDragX(-100);
    } else if (info.offset.x > 100) {
      // Swiped right - show edit
      setDragX(100);
    } else {
      // Return to center
      setDragX(0);
    }
    setIsDragging(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: dragX > 50 ? 1 : 0 }}
          className="flex items-center gap-2 text-primary"
        >
          <Edit className="h-5 w-5" />
          <span className="font-medium">Edit</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: dragX < -50 ? 1 : 0 }}
          className="flex items-center gap-2 text-destructive"
        >
          <span className="font-medium">Delete</span>
          <Trash2 className="h-5 w-5" />
        </motion.div>
      </div>

      {/* Event card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        transition={{ type: "spring", damping: 20 }}
        className="relative bg-card border rounded-lg cursor-pointer"
        onClick={() => !isDragging && onClick()}
      >
        {/* Timeline indicator */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          kind === 'date' && "bg-primary",
          kind === 'anniversary' && "bg-accent",
          kind === 'travel' && "bg-primary",
          kind === 'birthday' && "bg-secondary",
          kind === 'home' && "bg-muted-foreground",
          kind === 'coffee' && "bg-accent"
        )} />

        <div className="p-4 pl-6">
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex-shrink-0 mt-1"
            >
              <Icon className={cn("h-5 w-5", config.color)} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold truncate">{title}</h3>
                {confirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Check className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  </motion.div>
                )}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  {all_day ? (
                    <span>All day</span>
                  ) : (
                    <span>
                      {format(parseISO(starts_at), 'h:mm a')} - {format(parseISO(ends_at), 'h:mm a')}
                    </span>
                  )}
                </div>

                {meta?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{meta.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick action buttons (shown when swiped) */}
      {Math.abs(dragX) > 50 && (
        <div className="absolute inset-y-0 right-4 flex items-center gap-2">
          {dragX > 50 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setDragX(0);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          {dragX < -50 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setDragX(0);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
