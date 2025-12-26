import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { subscribeToStreaks } from '../services/streakService';
import { generateStreakReport } from '../services/pdfService';
import Heatmap from '../components/Heatmap';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToStreaks(user.uid, (data) => {
      setStreaks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Aggregate all completed dates from all streaks
  const allCompletedDates = useMemo(() => {
    const dates = [];
    streaks.forEach(streak => {
      if (streak.completedDates) {
        dates.push(...streak.completedDates);
      }
    });
    return dates;
  }, [streaks]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCompletions = allCompletedDates.length;
    const uniqueDays = new Set(allCompletedDates).size;
    const activeStreaks = streaks.filter(s => s.currentStreak > 0).length;
    const longestEverStreak = Math.max(...streaks.map(s => s.longestStreak || 0), 0);
    const currentBestStreak = Math.max(...streaks.map(s => s.currentStreak || 0), 0);

    // Calculate this week's completions
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekCompletions = allCompletedDates.filter(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= weekStart;
    }).length;

    // Calculate this month's completions
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCompletions = allCompletedDates.filter(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= monthStart;
    }).length;

    return {
      totalCompletions,
      uniqueDays,
      activeStreaks,
      longestEverStreak,
      currentBestStreak,
      thisWeekCompletions,
      thisMonthCompletions,
      totalStreaks: streaks.length
    };
  }, [streaks, allCompletedDates]);

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      await generateStreakReport(
        { email: user.email },
        streaks,
        allCompletedDates
      );
      toast.success('Report downloaded!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to generate report');
    } finally {
      setExportLoading(false);
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
              <Link to="/analytics" className="text-sm font-medium text-orange-500">
                Analytics
              </Link>
              <Link to="/calendar" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
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
            📊 Analytics
          </h2>
          <button
            onClick={handleExportPDF}
            disabled={exportLoading}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {exportLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-orange-500">{stats.totalStreaks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Streaks</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-500">{stats.activeStreaks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Streaks</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-500">{stats.totalCompletions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Completions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-500">{stats.longestEverStreak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.currentBestStreak} 🔥</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Best</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.thisWeekCompletions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.thisMonthCompletions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Activity Heatmap (Last 365 Days)
          </h3>
          <div className="overflow-x-auto">
            <Heatmap 
              completedDates={allCompletedDates}
              onDateClick={(date) => console.log('Clicked:', date)}
            />
          </div>
        </div>

        {/* Streak Performance */}
        {streaks.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Streak Performance
            </h3>
            <div className="space-y-4">
              {streaks.map(streak => (
                <div key={streak.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{streak.title}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {streak.currentStreak} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((streak.currentStreak / Math.max(streak.longestStreak || 1, 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Best: {streak.longestStreak || 0} days • Total: {streak.completedDates?.length || 0} completions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
