import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { subscribeToStreaks } from '../services/streakService';
import { subscribeToEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [streaks, setStreaks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const unsubStreaks = subscribeToStreaks(user.uid, (data) => {
      setStreaks(data);
    });

    const unsubEvents = subscribeToEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => {
      unsubStreaks();
      unsubEvents();
    };
  }, [user]);

  // Aggregate all completed dates from all streaks
  const allCompletedDates = useMemo(() => {
    const dates = [];
    streaks.forEach(streak => {
      if (streak.completedDates) {
        dates.push(...streak.completedDates);
      }
    });
    return [...new Set(dates)];
  }, [streaks]);

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (eventData.id) {
        await updateEvent(eventData.id, eventData);
        toast.success('Event updated!');
      } else {
        await createEvent(user.uid, eventData);
        toast.success('Event created!');
      }
    } catch (error) {
      toast.error('Failed to save event');
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted!');
    } catch (error) {
      toast.error('Failed to delete event');
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-orange-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Streak</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                Dashboard
              </Link>
              <Link to="/analytics" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                Analytics
              </Link>
              <Link to="/calendar" className="text-sm font-medium text-orange-500">
                Calendar
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📅 Calendar
          </h2>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
              setShowEventModal(true);
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>

        {/* Calendar Component */}
        <Calendar
          events={events}
          completedDates={allCompletedDates}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />

        {/* Upcoming Events */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Upcoming Events
          </h3>
          {events.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No events scheduled. Click a date to add one!</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                return events
                  .filter(e => e.date >= today)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{event.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(event.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ));
              })()}
            </div>
          )}
        </div>
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
