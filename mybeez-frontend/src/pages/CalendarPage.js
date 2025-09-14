import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';

import api from "../services/api";

import CalendarSidebar from "../components/calendar/CalendarSidebar";
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import AddEntryModal from '../components/calendar/AddEntryModal';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import DeleteConfirmModal from '../components/calendar/DeleteConfirmModal';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  // Core component state
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form state for the Add/Edit modal
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: null,
    end: null,
  });

  // UI state for filtering
  const [showExperienceEvents, setShowExperienceEvents] = useState(true);
  const [showPersonalEvents, setShowPersonalEvents] = useState(true);

  // UI state for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetches all calendar events within the current view's date range
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = moment(date).startOf(view).toISOString();
      const endDate = moment(date).endOf(view).toISOString();

      const response = await api.get('/calendar/events', {
        params: { startDate, endDate }
      });

      const formattedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
      }));

      setAllEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [date, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigates the calendar view (previous, next)
  const handleNavigate = (action) => {
    setDate(moment(date).add(action === 'PREV' ? -1 : 1, view).toDate());
  };

  // Populates form state and opens the modal when a slot is selected
  const handleSelectSlot = (slotInfo) => {
    setFormData({
      title: '',
      description: '',
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowAddModal(true);
  };

  // Opens the details modal when an existing event is clicked
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Submits a new personal entry to the API
  const handleCreateEntry = async (entryData) => {
    try {
      const newEntry = {
        title: entryData.title.trim(),
        description: entryData.description.trim(),
        startTime: entryData.start.toISOString(),
        endTime: entryData.end.toISOString()
      };

      await api.post('/calendar/personal-schedule', newEntry);
      toast.success('Personal entry created successfully!');
      setShowAddModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating personal entry:', error);
      toast.error('Failed to create personal entry.');
    }
  };

  // Deletes a personal entry via the API
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await api.delete(`/calendar/personal-schedule/${selectedEvent.id}`);
      toast.success('Event deleted successfully!');
      setShowDeleteModal(false);
      setShowEventModal(false); // Close the details modal after deletion
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event.');
    }
  };

  // Memoized derivation of events to display based on filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (event.type === 'experience' && showExperienceEvents) return true;
      if (event.type === 'personal' && showPersonalEvents) return true;
      return false;
    });
  }, [allEvents, showExperienceEvents, showPersonalEvents]);

  // Provides dynamic styling props for calendar events
  const eventPropGetter = (event) => {
    const className = event.type === 'experience'
        ? 'event-experience'
        : 'event-personal';
    return { className };
  };

  if (loading) {
    return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-lg text-gray-600">Loading calendar...</div>
          </div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-6 max-w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <CalendarSidebar
              showExperienceEvents={showExperienceEvents}
              setShowExperienceEvents={setShowExperienceEvents}
              showPersonalEvents={showPersonalEvents}
              setShowPersonalEvents={setShowPersonalEvents}
          />
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-4
                        [&_.rbc-toolbar]:hidden
                        [&_.rbc-header]:border-b-0 [&_.rbc-header]:py-3 [&_.rbc-header]:text-center [&_.rbc-header]:font-normal [&_.rbc-header]:text-sm [&_.rbc-header]:text-gray-700
                        [&_.rbc-month-view]:border-none
                        [&_.rbc-day-bg]:border-l [&_.rbc-day-bg]:border-t [&_.rbc-day-bg]:border-gray-200
                        [&_.rbc-day-bg:first-child]:border-l-0
                        [&_.rbc-month-row]:border-b [&_.rbc-month-row]:border-gray-200 [&_.rbc-month-row:last-child]:border-b-0
                        [&_.rbc-date-cell]:text-right [&_.rbc-date-cell]:pr-2 [&_.rbc-date-cell]:pt-1
                        [&_.rbc-off-range-bg]:!bg-gray-50
                        [&_.rbc-today]:!bg-blue-50
                        [&_.rbc-event]:!border-none [&_.rbc-event]:rounded-md [&_.rbc-event]:p-1 [&_.rbc-event]:text-xs [&_.rbc-event]:focus:outline-none
                        [&_.event-experience]:!bg-green-100 [&_.event-experience]:!text-green-800
                        [&_.event-personal]:!bg-blue-100 [&_.event-personal]:!text-blue-800
                    ">
              <CalendarToolbar
                  date={date}
                  view={view}
                  onNavigate={handleNavigate}
                  onView={setView}
              />
              <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 650 }}
                  view={view}
                  date={date}
                  onNavigate={setDate}
                  onView={setView}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable={true}
                  eventPropGetter={eventPropGetter}
                  components={{
                    toolbar: () => null,
                  }}
              />
            </div>
          </main>
        </div>

        <AddEntryModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateEntry}
        />
        <EventDetailsModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} event={selectedEvent} onDelete={() => { setShowEventModal(false); setShowDeleteModal(true); }} />
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} eventTitle={selectedEvent?.title} onConfirm={handleDeleteEvent} />
      </div>
  );
};

export default CalendarPage;