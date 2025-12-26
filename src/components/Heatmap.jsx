import { useMemo, useState } from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

export default function Heatmap({ completedDates = [], onDateClick }) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate 365 days grid (52 weeks + partial)
  const weeks = useMemo(() => {
    const dateCountMap = {};
    completedDates.forEach(date => {
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });

    const today = new Date();
    const startDate = subDays(today, 364);
    const firstSunday = startOfWeek(startDate, { weekStartsOn: 0 });
    
    const weeksArr = [];
    let currentDate = firstSunday;
    
    while (currentDate <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        week.push({
          date: currentDate,
          dateStr,
          count: dateCountMap[dateStr] || 0,
          isInRange: currentDate >= startDate && currentDate <= today
        });
        currentDate = addDays(currentDate, 1);
      }
      weeksArr.push(week);
    }
    
    return weeksArr;
  }, [completedDates]);

  const getColorClass = (count, isInRange) => {
    if (!isInRange) return 'bg-transparent';
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-400 dark:bg-green-700';
    if (count === 3) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  const handleMouseEnter = (e, day) => {
    if (!day.isInRange) return;
    setHoveredDate(day);
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const months = useMemo(() => {
    const monthLabels = [];
    let lastMonth = null;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d.isInRange);
      if (firstDayOfWeek) {
        const month = format(firstDayOfWeek.date, 'MMM');
        if (month !== lastMonth) {
          monthLabels.push({ month, weekIndex });
          lastMonth = month;
        }
      }
    });
    return monthLabels;
  }, [weeks]);

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex text-xs text-gray-500 dark:text-gray-400 mb-1 ml-8">
        {months.map(({ month, weekIndex }, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${weekIndex * 14 + 32}px` }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex mt-6">
        {/* Day labels */}
        <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mr-2 justify-between py-0.5">
          {dayLabels.map((label, i) => (
            <span key={i} className="h-3">{label}</span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-all ${getColorClass(day.count, day.isInRange)} ${
                    day.isInRange ? 'hover:ring-2 hover:ring-orange-400 cursor-pointer' : 'cursor-default'
                  }`}
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => day.isInRange && onDateClick && onDateClick(day.dateStr)}
                  disabled={!day.isInRange}
                  aria-label={day.isInRange ? `${day.count} completions on ${format(day.date, 'MMM d, yyyy')}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          <div className="font-medium">{format(hoveredDate.date, 'MMMM d, yyyy')}</div>
          <div className="text-gray-300">
            {hoveredDate.count} completion{hoveredDate.count !== 1 ? 's' : ''}
          </div>
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
