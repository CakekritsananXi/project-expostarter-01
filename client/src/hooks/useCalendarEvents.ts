import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryClient, apiRequest } from '../lib/queryClient';
import { CalendarEvent, CalendarEventInput, CalendarEventsResponse, PostsResponse, CampaignsResponse } from '../types/calendar';

// Custom hook for calendar events CRUD operations
export const useCalendarEvents = () => {
  // Fetch calendar events
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery<CalendarEventsResponse>({
    queryKey: ['/api/calendar-events'],
  });

  // Fetch posts for linking
  const { data: postsData } = useQuery<PostsResponse>({
    queryKey: ['/api/posts'],
  });

  // Fetch campaigns for linking
  const { data: campaignsData } = useQuery<CampaignsResponse>({
    queryKey: ['/api/campaigns'],
  });

  // Extract data with defaults
  const events = eventsData?.calendarEvents || [];
  const posts = postsData?.posts || [];
  const campaigns = campaignsData?.campaigns || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEventInput>) => {
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
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEventInput> & { id: number }) => {
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

  // Helper functions
  const createEvent = async (eventData: Partial<CalendarEventInput>) => {
    return createEventMutation.mutateAsync(eventData);
  };

  const updateEvent = async (id: number, eventData: Partial<CalendarEventInput>) => {
    return updateEventMutation.mutateAsync({ id, ...eventData });
  };

  const deleteEvent = async (eventId: number) => {
    return deleteEventMutation.mutateAsync(eventId);
  };

  const moveEvent = async (eventId: number, newDate: Date) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      await updateEvent(eventId, { eventDate: newDate.toISOString() });
      toast.success('Event moved successfully');
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  return {
    // Data
    events,
    posts,
    campaigns,
    
    // Loading states
    eventsLoading,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    
    // Error states
    eventsError,
    
    // Operations
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  };
};