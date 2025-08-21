import { FileText, Users, Target, AlertCircle, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { EventType, EventStatus } from '../types/calendar';

// Event type configuration
export const EVENT_TYPES = {
  content: {
    label: 'Content',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  deadline: {
    label: 'Deadline',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  meeting: {
    label: 'Meeting',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  launch: {
    label: 'Launch',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  }
} as const;

// Event status configuration
export const EVENT_STATUSES = {
  scheduled: {
    label: 'Scheduled',
    icon: CalendarIcon
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    additionalClasses: 'line-through'
  }
} as const;

// Base styling for events
export const BASE_EVENT_STYLE = "text-xs px-2 py-1 rounded-md font-medium truncate";

// Calendar view types
export const CALENDAR_VIEWS = ['month', 'week', 'day'] as const;
export type CalendarView = typeof CALENDAR_VIEWS[number];

// Day names for calendar header
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;