import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isToday
} from 'date-fns';

export default function Calendar({ 
  events = [], 
  completedDates = [],
  onDateClick,
  onEventClick
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEvents = events.filter(e => e.date === dateStr);
      const isCompleted = completedDates.includes(dateStr);
      
      days.push({
        date: day,
        dateStr,
        events: dayEvents,
        isCurrentMonth: isSameMonth(day, currentDate),
        isToday: isToday(day),
        isCompleted
      });
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate, events, completedDates]);

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDateClick = (day) => {
    setSelectedDate(day);
    if (onDateClick) {
      onDateClick(day.dateStr, day.events);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Today
            </button>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-l border-gray-200 dark:border-gray-700"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                relative min-h-[80px] p-1 rounded-lg text-left transition-all
                ${day.isCurrentMonth 
                  ? 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700' 
                  : 'bg-transparent text-gray-400 dark:text-gray-600'
                }
                ${day.isToday ? 'ring-2 ring-orange-400' : ''}
                ${selectedDate?.dateStr === day.dateStr ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <span className={`
                inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full
                ${day.isToday 
                  ? 'bg-orange-500 text-white' 
                  : day.isCurrentMonth 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-400 dark:text-gray-600'
                }
              `}>
                {format(day.date, 'd')}
              </span>
              
              {/* Completion indicator */}
              {day.isCompleted && (
                <div className="absolute top-1 right-1">
                  <span className="text-xs">✅</span>
                </div>
              )}

              {/* Events */}
              <div className="mt-1 space-y-0.5">
                {day.events.slice(0, 2).map((event, i) => (
                  <div
                    key={i}
                    className="text-xs px-1 py-0.5 rounded truncate bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    +{day.events.length - 2} more
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDate.events.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Events on {format(selectedDate.date, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {selectedDate.events.map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{event.title}</span>
                {onEventClick && (
                  <button
                    onClick={() => onEventClick(event)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
