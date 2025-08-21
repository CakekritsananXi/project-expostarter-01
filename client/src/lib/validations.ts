// Re-export validation schemas for client use
import { z } from 'zod';

// Calendar Event validation schema
export const insertCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventDate: z.string(),
  eventType: z.enum(['content', 'deadline', 'meeting', 'launch']).default('content'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  allDay: z.boolean().default(true),
  duration: z.number().optional(),
  postId: z.number().optional(),
  campaignId: z.number().optional(),
});

export type CalendarEventInput = z.infer<typeof insertCalendarEventSchema>;