import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import DayViewModal from './components/DayViewModal';
import { Exhibition } from './types';
import { fetchExhibitions } from './services/gemini';
import { Calendar as CalendarIcon, RefreshCw, Info, Lock, Key, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

// Constants for local storage
const STORAGE_KEY_API = 'lanka_expo_api_key';
const STORAGE_KEY_EVENTS = 'lanka_expo_events';
const STORAGE_KEY_TIMESTAMP = 'lanka_expo_timestamp';
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

const App: React.FC = () => {
  // Auth State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState('');
  
  // App State
  const [events, setEvents] = useState<Exhibition[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for Day View
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Exhibition[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Check for API Key in local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY_API);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Load data from local storage or fetch new
  const loadEvents = useCallback(async (key: string, forceRefresh = false) => {
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
      const newEvents = await fetchExhibitions(key);
      setEvents(newEvents);
      
      // Save to cache
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(newEvents));
      const newTime = Date.now();
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, newTime.toString());
      setLastUpdated(new Date(newTime).toLocaleString());

    } catch (err) {
      console.error(err);
      setError("Failed to update data. Your key might be invalid or quota exceeded.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger load when key is available
  useEffect(() => {
    if (apiKey) {
      loadEvents(apiKey);
    }
  }, [apiKey, loadEvents]);

  const handleRefresh = () => {
    if (apiKey && window.confirm("Updating will search the live web for the latest data. This may take a few seconds. Continue?")) {
      loadEvents(apiKey, true);
    }
  };

  const handleDayClick = (date: Date, eventsOnDay: Exhibition[]) => {
    setSelectedDate(date);
    setSelectedDayEvents(eventsOnDay);
  };

  const handleSaveKey = () => {
    if (inputKey.trim().length > 10) {
      localStorage.setItem(STORAGE_KEY_API, inputKey.trim());
      setApiKey(inputKey.trim());
    } else {
      alert("Please enter a valid API Key.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Disconnect your API Key?")) {
      localStorage.removeItem(STORAGE_KEY_API);
      setApiKey(null);
      setEvents([]);
    }
  };

  // Auth / Landing Screen (Wizard)
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Hero Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg border border-white/30">
                <CalendarIcon size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Lanka Expo</h1>
              <p className="text-indigo-100 font-medium text-sm">Sri Lanka's Automated Exhibition Calendar</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              
              <div className="text-center">
                 <h2 className="text-lg font-bold text-gray-900">One-Time Setup</h2>
                 <p className="text-gray-500 text-sm mt-1">Connect your Google account to enable AI search.</p>
              </div>

              {/* Step 1 */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">1</div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Get your Free Access Key</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Click the button below to open Google's key studio. Then click <strong>"Create API key"</strong>.
                    </p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center space-x-2 text-xs bg-white text-indigo-700 font-semibold py-2 px-3 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                      <span>Get Key from Google</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-1">
                 <div className="flex items-center space-x-3 mb-2">
                   <div className="bg-gray-900 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">2</div>
                   <h3 className="text-sm font-semibold text-gray-900">Paste the Key Here</h3>
                 </div>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Key size={16} className="text-gray-400" />
                   </div>
                   <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Paste your AI Studio Key..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                   />
                 </div>
              </div>

              <button
                onClick={handleSaveKey}
                disabled={inputKey.length < 10}
                className={`
                  w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all
                  ${inputKey.length > 10 
                    ? 'bg-gray-900 hover:bg-gray-800 hover:shadow-xl active:scale-95 cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed'}
                `}
              >
                <span>Connect & Start App</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 bg-gray-50 py-2 rounded-lg">
                <Lock size={12} />
                <span>Your key is stored locally on your device.</span>
              </div>
            </div>
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

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Last Updated</span>
               <span className="text-xs text-gray-600 font-medium">{lastUpdated || 'Never'}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-3 py-2 sm:px-4 rounded-full text-sm font-medium transition-all
                ${loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95'}
              `}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{loading ? 'Updating...' : 'Refresh Data'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Disconnect API Key"
            >
              <Lock size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Stats */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Discover What's Happening</h2>
            <p className="text-indigo-100 text-base sm:text-lg mb-6">
              Explore upcoming trade fairs, art exhibitions, and public events across Sri Lanka. 
              Data is automatically sourced and updated daily using Gemini AI.
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
