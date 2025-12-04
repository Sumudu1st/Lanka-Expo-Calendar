import React from 'react';
import { Exhibition } from '../types';
import { X, MapPin, Calendar as CalendarIcon, Clock, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventModalProps {
  event: Exhibition | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Header with decorative pattern */}
        <div className="relative h-24 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-10 relative">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4">
             <div className="bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-lg w-fit">
               Exhibition
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {event.name}
          </h2>

          <div className="space-y-4 mt-6">
            
            <div className="flex items-start space-x-3 text-gray-600">
              <CalendarIcon className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Date</p>
                <p className="text-sm">{formatDateRange(event.startDate, event.endDate)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-gray-600">
              <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Venue</p>
                <p className="text-sm">{event.venue}</p>
              </div>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-start space-x-3 text-gray-600">
                <Clock className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Time</p>
                  <p className="text-sm">
                    {event.startTime ? event.startTime : 'All Day'} 
                    {event.endTime ? ` - ${event.endTime}` : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 text-gray-600 pt-2 border-t border-gray-100">
              <Info className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">About</p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {event.description || "No detailed description available."}
                </p>
              </div>
            </div>
            
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
