import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';

// Custom hook for managing calendar modal state
export const useCalendarModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Open modal for creating new event
  const openCreateModal = (date?: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  // Open modal for editing existing event
  const openEditModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  // Close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Handle date click (create event for that date)
  const handleDateClick = (date: Date) => {
    openCreateModal(date);
  };

  // Handle event click (edit event)
  const handleEventClick = (event: CalendarEvent) => {
    openEditModal(event);
  };

  return {
    // State
    isModalOpen,
    selectedEvent,
    selectedDate,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    handleDateClick,
    handleEventClick,
  };
};