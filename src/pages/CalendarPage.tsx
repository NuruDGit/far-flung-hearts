import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, Edit, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { useToast } from '@/hooks/use-toast';
import AppNavigation from '@/components/AppNavigation';

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
  date: { bg: 'bg-love-heart/10', text: 'text-love-heart', border: 'border-love-heart/20' },
  anniversary: { bg: 'bg-love-deep/10', text: 'text-love-deep', border: 'border-love-deep/20' },
  travel: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  birthday: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  meeting: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' },
};

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
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
        .single();
      
      if (pairs) {
        setUserPairId(pairs.id);
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

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    // Create header
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <div key={i} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {format(addDays(startOfWeek(new Date()), i), 'EEE')}
        </div>
      );
    }

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[120px] border border-border/50 p-2 cursor-pointer hover:bg-secondary/50 transition-colors
              ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''}
              ${isToday ? 'bg-love-heart/5 border-love-heart/30' : ''}
            `}
            onClick={() => {
              setCurrentDate(cloneDay);
              setView('day');
            }}
          >
            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-love-heart' : ''}`}>
              {formattedDate}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => {
                const colors = eventTypeColors[event.kind] || eventTypeColors.other;
                return (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded ${colors.bg} ${colors.text} ${colors.border} border cursor-pointer hover:opacity-80`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    {!event.all_day && (
                      <div className="text-xs opacity-75">
                        {format(parseISO(event.starts_at), 'HH:mm')}
                      </div>
                    )}
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/30">
          {daysOfWeek}
        </div>
        {rows}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
      parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
    );

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        
        {dayEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No events scheduled for this day</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 bg-love-heart text-white hover:bg-love-deep"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => {
              const colors = eventTypeColors[event.kind] || eventTypeColors.other;
              return (
                <Card key={event.id} className={`cursor-pointer hover:shadow-md transition-shadow ${colors.border} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={`${colors.bg} ${colors.text}`}>
                            {event.kind}
                          </Badge>
                          {!event.all_day && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(event.starts_at), 'HH:mm')} - {format(parseISO(event.ends_at), 'HH:mm')}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                        {event.meta.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.meta.description}</p>
                        )}
                        {event.meta.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.meta.location}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Shared Calendar</h1>
            <p className="text-muted-foreground">Plan your time together</p>
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
              className="bg-love-heart text-white hover:bg-love-deep"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : addDays(currentDate, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
                {view === 'month' 
                  ? format(currentDate, 'MMMM yyyy')
                  : format(currentDate, 'EEEE, MMMM d, yyyy')
                }
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as 'month' | 'week' | 'day')}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Calendar Content */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={view} className="space-y-4">
            <TabsContent value="month">
              {renderCalendarGrid()}
            </TabsContent>
            <TabsContent value="day">
              {renderDayView()}
            </TabsContent>
          </Tabs>
        )}

        {/* Dialogs */}
        {showCreateDialog && userPairId && (
          <CreateEventDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            pairId={userPairId}
            selectedDate={currentDate}
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