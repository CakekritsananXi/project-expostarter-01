import React from 'react';
import CalendarView from '../components/calendar/CalendarView';
import EventModal from '../components/calendar/EventModal';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useCalendarModal } from '../hooks/useCalendarModal';
import { CalendarEventInput } from '../types/calendar';

const Calendar = () => {
  // Custom hooks for state management
  const {
    events,
    posts,
    campaigns,
    eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  } = useCalendarEvents();

  const {
    isModalOpen,
    selectedEvent,
    selectedDate,
    handleDateClick,
    handleEventClick,
    openCreateModal,
    closeModal,
  } = useCalendarModal();

  // Event handlers
  const handleSaveEvent = async (eventData: Partial<CalendarEventInput>) => {
    if (selectedEvent?.id) {
      // Update existing event
      await updateEvent(selectedEvent.id, eventData);
    } else {
      // Create new event
      await createEvent(eventData);
    }
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
        onEventDrop={moveEvent}
        onCreateEvent={() => openCreateModal()}
        isLoading={eventsLoading}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate || undefined}
        posts={posts}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Calendar;