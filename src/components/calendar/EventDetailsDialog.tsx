import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Edit, Trash2, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  kind: string;
  meta: any;
  pair_id: string;
}

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: (eventId: string) => void;
}

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  date: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  anniversary: { bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/20' },
  travel: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  birthday: { bg: 'bg-secondary/10', text: 'text-secondary-foreground', border: 'border-secondary/20' },
  meeting: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  other: { bg: 'bg-muted/10', text: 'text-muted-foreground', border: 'border-muted/20' },
};

const reminderLabels: Record<string, string> = {
  '15min': '15 minutes before',
  '30min': '30 minutes before',
  '1hour': '1 hour before',
  '1day': '1 day before',
  '1week': '1 week before',
};

export const EventDetailsDialog = ({ open, onOpenChange, event, onEdit, onDelete }: EventDetailsDialogProps) => {
  const { toast } = useToast();
  const colors = eventTypeColors[event.kind] || eventTypeColors.other;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      onDelete(event.id);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatEventTime = () => {
    const startDate = parseISO(event.starts_at);
    const endDate = parseISO(event.ends_at);

    if (event.all_day) {
      if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
        return `All day • ${format(startDate, 'EEEE, MMMM d, yyyy')}`;
      } else {
        return `All day • ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
    } else {
      if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
        return `${format(startDate, 'EEEE, MMMM d, yyyy')} • ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
      } else {
        return `${format(startDate, 'MMM d, HH:mm')} - ${format(endDate, 'MMM d, HH:mm yyyy')}`;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-love-heart" />
              Event Details
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="hover:bg-secondary"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Type Badge */}
          <Badge variant="secondary" className={`${colors.bg} ${colors.text} ${colors.border} border`}>
            {event.kind.charAt(0).toUpperCase() + event.kind.slice(1)}
          </Badge>

          {/* Event Title */}
          <h2 className="text-xl font-semibold text-foreground">{event.title}</h2>

          {/* Date and Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-foreground">
              {formatEventTime()}
            </div>
          </div>

          {/* Location */}
          {event.meta.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-foreground">
                {event.meta.location}
              </div>
            </div>
          )}

          {/* Reminder */}
          {event.meta.reminder && (
            <div className="flex items-start gap-3">
              <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-foreground">
                {reminderLabels[event.meta.reminder] || event.meta.reminder}
              </div>
            </div>
          )}

          {/* Description */}
          {event.meta.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.meta.description}
                </p>
              </div>
            </>
          )}

          {/* Timezone */}
          {event.meta.timezone && (
            <div className="text-xs text-muted-foreground">
              Timezone: {event.meta.timezone}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="bg-love-heart text-white hover:bg-love-deep"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};