import React from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AnimatedToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  icon,
}) => {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className={cn(
            "mt-1 transition-colors",
            checked ? "text-primary" : "text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <Label htmlFor={id} className="cursor-pointer font-medium">
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </motion.div>
  );
};
