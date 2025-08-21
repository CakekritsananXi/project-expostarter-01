import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Users, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { insertCalendarEventSchema } from '../../lib/validations';

interface CalendarEvent {
  id?: number;
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

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (eventId: number) => Promise<void>;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  posts: Post[];
  campaigns: Campaign[];
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  posts,
  campaigns
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    eventDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
    eventType: 'content',
    status: 'scheduled',
    allDay: true,
    duration: 60,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        eventDate: event.eventDate,
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        eventDate: selectedDate.toISOString(),
      }));
    }
  }, [event, selectedDate]);

  const eventTypeOptions = [
    { value: 'content', label: 'Content', icon: FileText, color: 'text-blue-600' },
    { value: 'deadline', label: 'Deadline', icon: AlertCircle, color: 'text-red-600' },
    { value: 'meeting', label: 'Meeting', icon: Users, color: 'text-purple-600' },
    { value: 'launch', label: 'Launch', icon: Target, color: 'text-orange-600' },
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const validateForm = () => {
    try {
      insertCalendarEventSchema.parse({
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        eventType: formData.eventType,
        status: formData.status,
        allDay: formData.allDay,
        duration: formData.allDay ? undefined : formData.duration,
        postId: formData.postId,
        campaignId: formData.campaignId,
      });
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for submission
      const eventData = {
        ...formData,
        duration: formData.allDay ? undefined : formData.duration,
      };

      await onSave(eventData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof CalendarEvent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
            data-testid="button-close-modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Input
              label="Event Title"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter event title..."
              required
              error={errors.title}
              data-testid="input-event-title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Add event description..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              data-testid="textarea-event-description"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypeOptions.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleFieldChange('eventType', type.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      formData.eventType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    data-testid={`button-event-type-${type.value}`}
                  >
                    <Icon className={`w-4 h-4 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div>
              <Input
                label="Date"
                type="date"
                value={formData.eventDate ? format(new Date(formData.eventDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleFieldChange('eventDate', date.toISOString());
                }}
                required
                error={errors.eventDate}
                data-testid="input-event-date"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay || false}
                onChange={(e) => handleFieldChange('allDay', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                data-testid="checkbox-all-day"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                All day event
              </label>
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.eventDate ? format(new Date(formData.eventDate), 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const date = new Date(formData.eventDate!);
                    date.setHours(parseInt(hours), parseInt(minutes));
                    handleFieldChange('eventDate', date.toISOString());
                  }}
                  data-testid="input-start-time"
                />
                <Input
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleFieldChange('duration', parseInt(e.target.value))}
                  placeholder="60"
                  min="15"
                  step="15"
                  error={errors.duration}
                  data-testid="input-duration"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status || 'scheduled'}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              data-testid="select-event-status"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Related Content */}
          <div className="space-y-4">
            {posts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Post (Optional)
                </label>
                <select
                  value={formData.postId || ''}
                  onChange={(e) => handleFieldChange('postId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  data-testid="select-related-post"
                >
                  <option value="">Select a post...</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {campaigns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Campaign (Optional)
                </label>
                <select
                  value={formData.campaignId || ''}
                  onChange={(e) => handleFieldChange('campaignId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  data-testid="select-related-campaign"
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {event && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                loading={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
                data-testid="button-delete-event"
              >
                Delete
              </Button>
            )}
            <div className="flex items-center space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                data-testid="button-save-event"
              >
                {event ? 'Update' : 'Create'} Event
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;