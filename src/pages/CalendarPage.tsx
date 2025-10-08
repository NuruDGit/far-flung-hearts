import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Edit, Filter, Search, Heart } from 'lucide-react';
import { DinnerPlateIcon } from '@/components/icons/DinnerPlateIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { AnimatedCalendar } from '@/components/calendar/AnimatedCalendar';
import { EventCard } from '@/components/calendar/EventCard';
import { useToast } from '@/hooks/use-toast';
import AppNavigation from '@/components/AppNavigation';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';
import { hasFeatureAccess } from '@/config/subscriptionFeatures';

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

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  date: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  anniversary: { bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/20' },
  travel: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  birthday: { bg: 'bg-secondary/10', text: 'text-secondary-foreground', border: 'border-secondary/20' },
  meeting: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  other: { bg: 'bg-muted/10', text: 'text-muted-foreground', border: 'border-muted/20' },
};

const CalendarPage = () => {
  const { user, loading: authLoading, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userPairId, setUserPairId] = useState<string | null>(null);

  // Get user's pair
  useEffect(() => {
    const getUserPair = async () => {
      if (!user) return;
      
      const { data: pairs } = await supabase
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      
      if (pairs) {
        setUserPairId(pairs.id);
      } else {
        // No pair found, stop loading
        setLoading(false);
      }
    };

    getUserPair();
  }, [user]);

  // Fetch events
  useEffect(() => {
    if (!userPairId) return;

    const fetchEvents = async () => {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('pair_id', userPairId)
        .gte('starts_at', monthStart.toISOString())
        .lte('starts_at', monthEnd.toISOString())
        .order('starts_at');

      if (error) {
        toast({
          title: "Error loading events",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [currentDate, userPairId, toast]);

  // Filter events based on search and type
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.meta.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.meta.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.kind === filterType);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType]);

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.starts_at);
      return isSameDay(eventDate, date);
    });
  };


  const renderEventList = () => {
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => 
      parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
    );

    const getEventIcon = (kind: string) => {
      switch (kind) {
        case 'date':
          return <DinnerPlateIcon className="h-6 w-6 text-muted-foreground" />;
        case 'anniversary':
          return <Heart className="h-6 w-6 text-muted-foreground" />;
        case 'travel':
          return <MapPin className="h-6 w-6 text-muted-foreground" />;
        case 'birthday':
          return <Calendar className="h-6 w-6 text-muted-foreground" />;
        case 'meeting':
          return <Clock className="h-6 w-6 text-muted-foreground" />;
        default:
          return <Calendar className="h-6 w-6 text-muted-foreground" />;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {format(selectedDate, 'MMMM d')}
          </h3>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="text-love-heart border-love-heart hover:bg-love-heart hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        {dayEvents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <Calendar className="mx-auto mb-3 text-muted-foreground/50" size={32} />
            <p className="text-sm text-muted-foreground">No events for this day</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard
                  {...event}
                  onEdit={() => {
                    setSelectedEvent(event);
                    setShowEditDialog(true);
                  }}
                  onDelete={() => handleEventDeleted(event.id)}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowDetailsDialog(true);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
    toast({
      title: "Event created",
      description: "Your event has been added to the calendar.",
    });
  };

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    toast({
      title: "Event updated",
      description: "Your event has been updated.",
    });
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event deleted",
      description: "Your event has been removed from the calendar.",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Premium feature guard for calendar events
  if (!hasFeatureAccess(subscription.tier, 'calendarEvents')) {
    return (
      <SubscriptionGuard 
        requiredTier="premium" 
        featureName="Calendar & Events"
      >
        <></>
      </SubscriptionGuard>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Shared Calendar</h1>
              <p className="text-muted-foreground">Plan your time together</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-auto"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-love-heart text-white hover:bg-love-deep shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="hover:bg-love-heart/10 hover:text-love-heart"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-bold text-foreground min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="hover:bg-love-heart/10 hover:text-love-heart"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="text-love-heart border-love-heart hover:bg-love-heart hover:text-white"
          >
            Today
          </Button>
        </div>

        {/* Calendar Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart"></div>
          </div>
        ) : !userPairId ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h2 className="text-xl font-semibold mb-2">No Active Connection</h2>
                <p className="text-muted-foreground mb-4">
                  Connect with your partner to start planning events together.
                </p>
                <Button 
                  onClick={() => navigate('/pair-setup')}
                  className="bg-love-heart text-white hover:bg-love-deep"
                >
                  Set Up Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <AnimatedCalendar
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={filteredEvents}
                onDateSelect={setSelectedDate}
              />
            </div>
            
            {/* Event List */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardContent className="p-4">
                  {renderEventList()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Dialogs */}
        {showCreateDialog && userPairId && (
          <CreateEventDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            pairId={userPairId}
            selectedDate={selectedDate}
            onEventCreated={handleEventCreated}
          />
        )}

        {selectedEvent && showDetailsDialog && (
          <EventDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            event={selectedEvent}
            onEdit={() => {
              setShowDetailsDialog(false);
              setShowEditDialog(true);
            }}
            onDelete={handleEventDeleted}
          />
        )}

        {selectedEvent && showEditDialog && (
          <EditEventDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            event={selectedEvent}
            onEventUpdated={handleEventUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;