import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  kind: string;
}

interface AnimatedCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

const eventTypeColors: Record<string, string> = {
  date: 'bg-primary',
  anniversary: 'bg-accent',
  travel: 'bg-primary',
  birthday: 'bg-secondary',
  home: 'bg-muted-foreground',
  coffee: 'bg-accent',
  other: 'bg-muted-foreground',
};

export const AnimatedCalendar: React.FC<AnimatedCalendarProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.starts_at), date)
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-2"
        >
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isWeekendDay = isWeekend(day);

            return (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => onDateSelect(day)}
                      className={cn(
                        "relative aspect-square p-2 rounded-lg transition-all hover:scale-105",
                        "flex flex-col items-center justify-start",
                        !isCurrentMonth && "text-muted-foreground opacity-40",
                        isWeekendDay && isCurrentMonth && "bg-muted/30",
                        isSelected && "bg-primary text-primary-foreground shadow-elevation-2",
                        !isSelected && isCurrentDay && "ring-2 ring-primary ring-offset-2",
                        !isSelected && !isCurrentDay && "hover:bg-muted"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentDay && !isSelected && "font-bold"
                      )}>
                        {format(day, 'd')}
                      </span>

                      {/* Today indicator */}
                      {isCurrentDay && !isSelected && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2 border-primary"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-1 mt-auto">
                          {dayEvents.slice(0, 3).map(event => (
                            <motion.div
                              key={event.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                eventTypeColors[event.kind] || eventTypeColors.other,
                                isSelected && "bg-primary-foreground"
                              )}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px]">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  {dayEvents.length > 0 && (
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        {dayEvents.slice(0, 5).map(event => (
                          <div key={event.id} className="text-xs">
                            • {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 5} more
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
