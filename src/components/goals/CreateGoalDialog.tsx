import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
          pair_id: pairData.id
        });

      if (error) throw error;

      toast({
        title: "Goal created!",
        description: "Your goal has been added successfully."
      });

      // Reset form
      setDescription('');
      setTargetDate(undefined);
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