import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Target, Heart, Star, Trophy, Flag, Lightbulb, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  description?: string;
  target_date?: string;
  pair_id: string;
  color?: string;
  icon?: string;
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: () => void;
  goal: Goal | null;
}

export function EditGoalDialog({ open, onOpenChange, onGoalUpdated, goal }: EditGoalDialogProps) {
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
    { value: '#10B981', label: 'Green', class: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
    { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
    { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' },
  ];

  const iconOptions = [
    { value: 'target', label: 'Target', Icon: Target },
    { value: 'heart', label: 'Heart', Icon: Heart },
    { value: 'star', label: 'Star', Icon: Star },
    { value: 'trophy', label: 'Trophy', Icon: Trophy },
    { value: 'flag', label: 'Flag', Icon: Flag },
    { value: 'lightbulb', label: 'Idea', Icon: Lightbulb },
    { value: 'zap', label: 'Energy', Icon: Zap },
  ];

  useEffect(() => {
    if (goal) {
      setDescription(goal.description || '');
      setTargetDate(goal.target_date ? new Date(goal.target_date) : undefined);
      setSelectedColor(goal.color || '#3B82F6');
      setSelectedIcon(goal.icon || 'target');
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !goal) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('goalboard')
        .update({
          description: description.trim(),
          target_date: targetDate ? targetDate.toISOString().split('T')[0] : null,
          color: selectedColor,
          icon: selectedIcon
        })
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: "Goal updated!",
        description: "Your goal has been updated successfully."
      });

      onOpenChange(false);
      onGoalUpdated();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setDescription(goal?.description || '');
    setTargetDate(goal?.target_date ? new Date(goal.target_date) : undefined);
    setSelectedColor(goal?.color || '#3B82F6');
    setSelectedIcon(goal?.icon || 'target');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Goal Description</Label>
            <Textarea
              id="description"
              placeholder="What would you like to achieve together?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Target Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a target date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.value ? 'border-foreground scale-110' : 'border-muted'
                    } ${color.class}`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {iconOptions.find(icon => icon.value === selectedIcon)?.Icon && (
                        React.createElement(iconOptions.find(icon => icon.value === selectedIcon)!.Icon, { 
                          size: 16, 
                          style: { color: selectedColor } 
                        })
                      )}
                      {iconOptions.find(icon => icon.value === selectedIcon)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <icon.Icon size={16} style={{ color: selectedColor }} />
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !description.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}