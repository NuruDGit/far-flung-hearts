import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  description?: string;
  target_date?: string;
  pair_id: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (goal) {
      setDescription(goal.description || '');
      setTargetDate(goal.target_date ? new Date(goal.target_date) : undefined);
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