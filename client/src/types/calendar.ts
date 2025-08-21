// Centralized calendar types
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventType: EventType;
  status: EventStatus;
  allDay: boolean;
  duration?: number;
  postId?: number;
  campaignId?: number;
}

export interface CalendarEventInput extends Omit<CalendarEvent, 'id'> {
  id?: number;
}

export type EventType = 'content' | 'deadline' | 'meeting' | 'launch';
export type EventStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Post {
  id: number;
  title: string;
  status: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: string;
}

// Calendar API responses
export interface CalendarEventsResponse {
  calendarEvents: CalendarEvent[];
}

export interface PostsResponse {
  posts: Post[];
}

export interface CampaignsResponse {
  campaigns: Campaign[];
}