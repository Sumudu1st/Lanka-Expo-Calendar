import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO,
  getDay
} from 'date-fns';
import { Exhibition } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  events: Exhibition[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDayClick: (date: Date, events: Exhibition[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  currentDate, 
  onDateChange, 
  onDayClick 
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper to check if an event happens on a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      try {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return isWithinInterval(day, { start, end });
      } catch (e) {
        return false;
      }
    });
  };

  // Render a single event bar
  const renderEventBar = (event: Exhibition, day: Date, index: number) => {
    // Simple hashing for color variety based on event ID length/chars
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-pink-100 text-pink-700 border-pink-200'
    ];
    const colorIndex = (event.id.charCodeAt(0) + event.id.length) % colors.length;
    const colorClass = colors[colorIndex];
    
    return (
      <div
        key={`${event.id}-${day.toISOString()}`}
        className={`
          w-full text-left mb-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium truncate border
          ${colorClass}
          block
        `}
      >
        {event.name}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-gray-200 gap-px">
        {calendarDays.map((day, dayIdx) => {
          const isCurrentMonthDay = isSameMonth(day, monthStart);
          const dayEvents = getEventsForDay(day);
          const isTodayDay = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day, dayEvents)}
              className={`min-h-[100px] sm:min-h-[120px] bg-white p-1 sm:p-2 flex flex-col group relative transition-colors cursor-pointer
                ${!isCurrentMonthDay ? 'bg-gray-50/50' : ''}
                ${isTodayDay ? 'bg-indigo-50/30' : ''}
                hover:bg-indigo-50/50
              `}
            >
              <span 
                className={`
                  self-end text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-1
                  ${isTodayDay 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : isCurrentMonthDay ? 'text-gray-700' : 'text-gray-400'}
                `}
              >
                {format(day, 'd')}
              </span>

              <div className="flex-1 flex flex-col overflow-hidden gap-y-0.5">
                {dayEvents.slice(0, 3).map((event, idx) => renderEventBar(event, day, idx))}
                
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500 pl-1 font-medium">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;