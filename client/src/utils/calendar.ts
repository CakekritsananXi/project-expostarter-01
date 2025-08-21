import React from 'react';
import { isSameDay } from 'date-fns';
import { CalendarEvent, EventType, EventStatus } from '../types/calendar';
import { EVENT_TYPES, EVENT_STATUSES, BASE_EVENT_STYLE } from '../constants/calendar';

// Get events for a specific date
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => 
    isSameDay(new Date(event.eventDate), date)
  );
};

// Generate event styling based on type and status
export const getEventStyle = (eventType: EventType, status: EventStatus): string => {
  // Status takes priority over type for styling
  if (status === 'completed') {
    const statusConfig = EVENT_STATUSES.completed;
    return `${BASE_EVENT_STYLE} ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`;
  }
  
  if (status === 'cancelled') {
    const statusConfig = EVENT_STATUSES.cancelled;
    return `${BASE_EVENT_STYLE} ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} ${statusConfig.additionalClasses}`;
  }

  // Use event type styling for scheduled events
  const typeConfig = EVENT_TYPES[eventType];
  if (typeConfig) {
    return `${BASE_EVENT_STYLE} ${typeConfig.bgColor} ${typeConfig.textColor} border ${typeConfig.borderColor}`;
  }

  // Default styling
  return `${BASE_EVENT_STYLE} bg-gray-100 text-gray-700 border border-gray-200`;
};

// Get icon component for event
export const getEventIcon = (eventType: EventType, status: EventStatus): React.ReactElement => {
  // Status icons take priority
  if (status === 'completed') {
    const StatusIcon = EVENT_STATUSES.completed.icon;
    return React.createElement(StatusIcon, { className: "w-3 h-3" });
  }
  
  if (status === 'cancelled') {
    const StatusIcon = EVENT_STATUSES.cancelled.icon;
    return React.createElement(StatusIcon, { className: "w-3 h-3" });
  }

  // Use event type icon for scheduled events
  const typeConfig = EVENT_TYPES[eventType];
  if (typeConfig) {
    const TypeIcon = typeConfig.icon;
    return React.createElement(TypeIcon, { className: "w-3 h-3" });
  }

  // Default icon
  const DefaultIcon = EVENT_STATUSES.scheduled.icon;
  return React.createElement(DefaultIcon, { className: "w-3 h-3" });
};

// Validate event data
export const validateEventData = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.eventDate) {
    errors.eventDate = 'Date is required';
  }
  
  if (!data.allDay && !data.duration) {
    errors.duration = 'Duration is required for timed events';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};