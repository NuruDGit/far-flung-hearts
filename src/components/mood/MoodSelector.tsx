import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

const moodOptions: MoodOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Peaceful', value: 'peaceful' },
  { emoji: '😍', label: 'Loved', value: 'loved' },
  { emoji: '😎', label: 'Confident', value: 'confident' },
  { emoji: '🥰', label: 'Grateful', value: 'grateful' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '😢', label: 'Crying', value: 'crying' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
];

interface MoodSelectorProps {
  selectedMood: string;
  onSelectMood: (emoji: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">How are you feeling?</h3>
      
      <div className="grid grid-cols-4 gap-3">
        {moodOptions.map((mood, index) => {
          const isSelected = selectedMood === mood.emoji;
          const isHovered = hoveredMood === mood.value;

          return (
            <motion.button
              key={mood.value}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredMood(mood.value)}
              onHoverEnd={() => setHoveredMood(null)}
              onClick={() => onSelectMood(mood.emoji)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                "border-2 hover:border-primary/50",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-elevation-2" 
                  : "border-transparent bg-muted/50"
              )}
            >
              <motion.div
                animate={{
                  scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
                  rotate: isSelected ? [0, -10, 10, -10, 0] : 0,
                }}
                transition={{ duration: 0.3 }}
                className="text-4xl"
              >
                {mood.emoji}
              </motion.div>
              
              <span className={cn(
                "text-xs font-medium transition-colors",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {mood.label}
              </span>

              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2"
                  transition={{ type: "spring", damping: 20 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
