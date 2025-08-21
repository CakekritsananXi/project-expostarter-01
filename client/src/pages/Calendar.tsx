import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import CalendarView from '../components/calendar/CalendarView';
import EventModal from '../components/calendar/EventModal';
import { queryClient, apiRequest } from '../lib/queryClient';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventType: 'content' | 'deadline' | 'meeting' | 'launch';
  status: 'scheduled' | 'completed' | 'cancelled';
  allDay: boolean;
  duration?: number;
  postId?: number;
  campaignId?: number;
}

interface Post {
  id: number;
  title: string;
  status: string;
}

interface Campaign {
  id: number;
  name: string;
  status: string;
}

const Calendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch calendar events
  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ calendarEvents: CalendarEvent[] }>({
    queryKey: ['/api/calendar-events'],
  });

  // Fetch posts for linking
  const { data: postsData } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/posts'],
  });

  // Fetch campaigns for linking
  const { data: campaignsData } = useQuery<{ campaigns: Campaign[] }>({
    queryKey: ['/api/campaigns'],
  });

  const events = eventsData?.calendarEvents || [];
  const posts = postsData?.posts || [];
  const campaigns = campaignsData?.campaigns || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      return apiRequest('/api/calendar-events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast.success('Event created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEvent> & { id: number }) => {
      return apiRequest(`/api/calendar-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast.success('Event updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest(`/api/calendar-events/${eventId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleEventDrop = async (eventId: number, newDate: Date) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        eventDate: newDate.toISOString(),
      });
      toast.success('Event moved successfully');
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent?.id) {
      // Update existing event
      await updateEventMutation.mutateAsync({
        id: selectedEvent.id,
        ...eventData,
      });
    } else {
      // Create new event
      await createEventMutation.mutateAsync(eventData);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    await deleteEventMutation.mutateAsync(eventId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Editorial Calendar
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Plan, schedule, and organize your content strategy with drag-and-drop functionality
        </p>
      </div>

      <CalendarView
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onCreateEvent={handleCreateEvent}
        isLoading={eventsLoading}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate || undefined}
        posts={posts}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Calendar;