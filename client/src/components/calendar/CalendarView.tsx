import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CalendarEvent } from '../../types/calendar';
import { getEventsForDate, getEventStyle, getEventIcon } from '../../utils/calendar';
import { EVENT_TYPES, CALENDAR_VIEWS, DAY_NAMES, CalendarView as ViewType } from '../../constants/calendar';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onEventDrop: (eventId: number, newDate: Date) => void;
  onCreateEvent: () => void;
  isLoading?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  onCreateEvent,
  isLoading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      onEventDrop(draggedEvent.id, date);
      setDraggedEvent(null);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2"
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2"
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            data-testid="button-today"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {CALENDAR_VIEWS.map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  view === viewType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid={`button-view-${viewType}`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreateEvent}
            className="hidden sm:flex"
            data-testid="button-create-event"
          >
            Add Event
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateEvent}
            className="sm:hidden p-2"
            data-testid="button-create-event-mobile"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date) => {
          const dayEvents = getEventsForDate(events, date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`min-h-[120px] p-2 border border-gray-100 rounded-lg transition-colors ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50 cursor-pointer`}
              onClick={() => onDateClick(date)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
              data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isCurrentDay ? 'text-blue-600' : ''}`}>
                  {format(date, 'd')}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={getEventStyle(event.eventType, event.status)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center space-x-1">
                      {getEventIcon(event.eventType, event.status)}
                      <span className="truncate">{event.title}</span>
                      {!event.allDay && event.duration && (
                        <Clock className="w-3 h-3 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {Object.entries(EVENT_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-gray-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default CalendarView;