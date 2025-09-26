import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, Target, Heart, Star, Trophy, Flag, Lightbulb, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      // Get user's pair_id from pairs table
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${(await supabase.auth.getUser()).data.user?.id},user_b.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .single();

      if (pairError) throw pairError;
      if (!pairData) throw new Error('No pair found');

      const { error } = await supabase
        .from('goalboard')
        .insert({
          description: description.trim(),
          target_date: targetDate ? targetDate.toISOString().split('T')[0] : null,
          pair_id: pairData.id,
          color: selectedColor,
          icon: selectedIcon
        });

      if (error) throw error;

      toast({
        title: "Goal created!",
        description: "Your goal has been added successfully."
      });

      // Reset form
      setDescription('');
      setTargetDate(undefined);
      setSelectedColor('#3B82F6');
      setSelectedIcon('target');
      onOpenChange(false);
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
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
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !description.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}