import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

const WEEKS_TO_SHOW = 53;
const DAYS_IN_WEEK = 7;

function getIntensityClass(count, maxCount) {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
  
  const ratio = maxCount > 0 ? count / maxCount : 0;
  
  if (ratio <= 0.25) return 'bg-green-200 dark:bg-green-900';
  if (ratio <= 0.5) return 'bg-green-400 dark:bg-green-700';
  if (ratio <= 0.75) return 'bg-green-500 dark:bg-green-600';
  return 'bg-green-600 dark:bg-green-500';
}

export default function ActivityHeatmap({ completionData = {}, onDateClick }) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const { weeks, maxCount, months } = useMemo(() => {
    const today = new Date();
    const weeks = [];
    let maxCount = 0;
    const months = [];
    let lastMonth = -1;

    // Start from the beginning of the week, WEEKS_TO_SHOW weeks ago
    const startDate = startOfWeek(subDays(today, WEEKS_TO_SHOW * 7), { weekStartsOn: 0 });

    for (let weekIndex = 0; weekIndex < WEEKS_TO_SHOW; weekIndex++) {
      const week = [];
      
      for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex++) {
        const date = addDays(startDate, weekIndex * 7 + dayIndex);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = completionData[dateStr] || 0;
        
        if (count > maxCount) maxCount = count;
        
        // Track month labels
        const month = date.getMonth();
        if (month !== lastMonth) {
          months.push({ weekIndex, label: format(date, 'MMM') });
          lastMonth = month;
        }
        
        week.push({
          date,
          dateStr,
          count,
          isFuture: date > today
        });
      }
      
      weeks.push(week);
    }

    return { weeks, maxCount, months };
  }, [completionData]);

  const handleMouseEnter = (e, day) => {
    if (day.isFuture) return;
    
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredDate(day);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span>📊</span> Activity Heatmap
      </h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {months.map((month, i) => (
              <div
                key={i}
                className="text-xs text-gray-500 dark:text-gray-400"
                style={{ 
                  position: 'relative',
                  left: `${month.weekIndex * 14}px`,
                  marginRight: i < months.length - 1 ? 
                    `${(months[i + 1]?.weekIndex - month.weekIndex - 1) * 14}px` : 0
                }}
              >
                {month.label}
              </div>
            ))}
          </div>
          
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Mon</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Wed</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Fri</span>
              <span className="h-[12px] leading-[12px]"></span>
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day) => (
                    <motion.div
                      key={day.dateStr}
                      className={`w-[10px] h-[10px] rounded-sm cursor-pointer transition-colors ${
                        day.isFuture 
                          ? 'bg-gray-100 dark:bg-gray-800 cursor-default' 
                          : getIntensityClass(day.count, maxCount)
                      }`}
                      whileHover={!day.isFuture ? { scale: 1.3 } : {}}
                      onMouseEnter={(e) => handleMouseEnter(e, day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      onClick={() => !day.isFuture && onDateClick && onDateClick(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-[2px]">
              <div className="w-[10px] h-[10px] rounded-sm bg-gray-200 dark:bg-gray-700" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-500 dark:bg-green-600" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDate && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-semibold">
              {format(hoveredDate.date, 'MMMM d, yyyy')}
            </div>
            <div className="text-gray-300">
              {hoveredDate.count} completion{hoveredDate.count !== 1 ? 's' : ''}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
