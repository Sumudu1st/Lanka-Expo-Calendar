import React, { useState } from 'react';
import { Exhibition } from '../types';
import { X, MapPin, Calendar as CalendarIcon, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DayViewModalProps {
  date: Date;
  events: Exhibition[];
  onClose: () => void;
}

const DayViewModal: React.FC<DayViewModalProps> = ({ date, events, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const s = parseISO(start);
      const e = parseISO(end);
      if (start === end) {
        return format(s, 'MMMM do, yyyy');
      }
      return `${format(s, 'MMM do')} - ${format(e, 'MMM do, yyyy')}`;
    } catch (e) {
      return `${start} to ${end}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center px-6 shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="z-10 text-white">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Events On</p>
            <h2 className="text-2xl font-bold">{format(date, 'MMMM do, yyyy')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No exhibitions scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => {
                 const isExpanded = expandedId === event.id;
                 return (
                   <div 
                      key={event.id} 
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                   >
                     <button 
                        onClick={() => toggleExpand(event.id)}
                        className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
                     >
                       <div className="pr-4">
                         <h3 className={`font-semibold text-gray-900 ${isExpanded ? 'text-indigo-700' : ''}`}>{event.name}</h3>
                         {!isExpanded && (
                           <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] sm:max-w-[250px]">{event.venue}</p>
                         )}
                       </div>
                       {isExpanded ? <ChevronUp size={20} className="text-indigo-500 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
                     </button>
                     
                     {isExpanded && (
                       <div className="px-4 pb-4 pt-0 text-sm space-y-3 border-t border-indigo-100/50 mt-1 animate-fadeIn">
                          <div className="flex items-start space-x-2 text-gray-600 mt-3">
                            <MapPin size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                            <span className="font-medium">{event.venue}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-gray-600">
                            <Clock size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                            <span>
                              {formatDateRange(event.startDate, event.endDate)}
                              {event.startTime && ` • ${event.startTime}`}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2 text-gray-600 pt-2 border-t border-indigo-100/50">
                             <Info size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                             <p className="leading-relaxed">{event.description || "No description available."}</p>
                          </div>
                       </div>
                     )}
                   </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayViewModal;