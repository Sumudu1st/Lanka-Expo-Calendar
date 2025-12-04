import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import DayViewModal from './components/DayViewModal';
import { Exhibition } from './types';
import { fetchExhibitions } from './services/gemini';
import { Calendar as CalendarIcon, RefreshCw, Info, Lock } from 'lucide-react';

// Constants for local storage
const STORAGE_KEY_EVENTS = 'lanka_expo_events';
const STORAGE_KEY_TIMESTAMP = 'lanka_expo_timestamp';
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

const App: React.FC = () => {
  // Auth State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // App State
  const [events, setEvents] = useState<Exhibition[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for Day View
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Exhibition[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio) {
          const has = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(has);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  // Load data from local storage or fetch new
  const loadEvents = useCallback(async (forceRefresh = false) => {
    if (!hasApiKey) return;

    setLoading(true);
    setError(null);

    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const storedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      const now = Date.now();

      // Check cache validity
      if (!forceRefresh && storedEvents && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp, 10);
        if (now - timestamp < CACHE_DURATION) {
          setEvents(JSON.parse(storedEvents));
          setLastUpdated(new Date(timestamp).toLocaleString());
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const newEvents = await fetchExhibitions();
      setEvents(newEvents);
      
      // Save to cache
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(newEvents));
      const newTime = Date.now();
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, newTime.toString());
      setLastUpdated(new Date(newTime).toLocaleString());

    } catch (err) {
      console.error(err);
      setError("Failed to update exhibition data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [hasApiKey]);

  // Load events once authenticated
  useEffect(() => {
    if (hasApiKey) {
      loadEvents();
    }
  }, [hasApiKey, loadEvents]);

  const handleRefresh = () => {
    if (window.confirm("Updating will search the live web for the latest data. This may take a few seconds. Continue?")) {
      loadEvents(true);
    }
  };

  const handleDayClick = (date: Date, eventsOnDay: Exhibition[]) => {
    setSelectedDate(date);
    setSelectedDayEvents(eventsOnDay);
  };

  const handleConnect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Failed to select key", e);
        alert("Failed to connect API Key. Please try again.");
      }
    } else {
      console.warn("AI Studio window object not found");
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Auth / Landing Screen
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <CalendarIcon size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Lanka Expo Calendar</h1>
              <p className="text-indigo-100 font-medium">Sri Lanka's Exhibition Guide</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8 text-center space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Authentication Required</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                To access real-time exhibition data, this application requires a Google account connection.
              </p>
              
              <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-lg flex items-start text-left">
                <Lock className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-blue-600" />
                <p>
                  We prioritize your privacy. The app runs locally in your browser using your own secure key. 
                </p>
              </div>
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <svg className="w-3 h-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              </span>
              <span>Connect with Google</span>
            </button>
            
            <p className="mt-6 text-[10px] text-center text-gray-400">
              By connecting, you agree to use your own API key. Standard usage limits apply.<br/>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 transition-colors">
                View billing information
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App View
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Lanka Expo</h1>
              <p className="text-xs text-gray-500 mt-1">Sri Lanka Exhibition Calendar</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Last Updated</span>
               <span className="text-xs text-gray-600 font-medium">{lastUpdated || 'Never'}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95'}
              `}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{loading ? 'Updating...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Stats */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Discover What's Happening</h2>
            <p className="text-indigo-100 text-lg mb-6">
              Explore upcoming trade fairs, art exhibitions, and public events across Sri Lanka. 
              Data is automatically sourced and updated daily.
            </p>
            <div className="flex items-center space-x-2 text-sm bg-white/10 w-fit px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
              <Info size={16} className="text-indigo-200" />
              <span>Showing <strong>{events.length}</strong> upcoming events</span>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center space-x-2">
            <Info size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Calendar View */}
        <div className="space-y-6">
          <Calendar 
            events={events}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400 pb-8">
          <p>Powered by Google Gemini 2.5 & Search Grounding</p>
          <p className="mt-1">Disclaimer: Dates and details are AI-sourced and may vary. Verify with official organizers.</p>
        </footer>
      </main>

      {/* Day View Modal */}
      {selectedDate && (
        <DayViewModal 
          date={selectedDate}
          events={selectedDayEvents}
          onClose={() => setSelectedDate(null)} 
        />
      )}
      
    </div>
  );
};

export default App;