import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  subscribeToStreaks, 
  createStreak, 
  markStreakDone, 
  undoStreakDone, 
  deleteStreak,
  isCompletedToday,
  getAllCompletionDates 
} from '../services/streakService';
import StreakCard from '../components/StreakCard';
import AddStreakModal from '../components/AddStreakModal';
import ActivityHeatmap from '../components/ActivityHeatmap';
import toast from 'react-hot-toast';
import { getDailyQuote } from '../data/quotes';

// Milestone thresholds for confetti celebration
const MILESTONE_DAYS = [7, 14, 21, 30, 50, 100, 365];

export default function Dashboard() {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('streaks');
  const [quote] = useState(() => getDailyQuote());

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToStreaks(user.uid, (data) => {
      setStreaks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (streaks.length === 0) {
      return {
        totalStreaks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        completedToday: 0
      };
    }

    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;
    let totalCompletions = 0;
    let completedToday = 0;

    streaks.forEach(streak => {
      if (streak.currentStreak > maxCurrentStreak) {
        maxCurrentStreak = streak.currentStreak;
      }
      if (streak.longestStreak > maxLongestStreak) {
        maxLongestStreak = streak.longestStreak;
      }
      totalCompletions += (streak.completedDates || []).length;
      if (isCompletedToday(streak.completedDates)) {
        completedToday++;
      }
    });

    return {
      totalStreaks: streaks.length,
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
      totalCompletions,
      completedToday
    };
  }, [streaks]);

  const completionData = useMemo(() => {
    return getAllCompletionDates(streaks);
  }, [streaks]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleAddStreak = async (title) => {
    try {
      await createStreak(user.uid, title);
      toast.success('Streak created! 🎯');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create streak:', error);
      toast.error('Failed to create streak');
    }
  };

  const handleMarkDone = async (streak) => {
    try {
      await markStreakDone(streak.id, streak.completedDates || []);
      
      // Check if hitting a milestone
      const newStreak = streak.currentStreak + 1;
      if (MILESTONE_DAYS.includes(newStreak)) {
        triggerConfetti();
        toast.success(`🎉 Amazing! ${newStreak} day streak!`);
      } else {
        toast.success('Great job! Keep it up! 🔥');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to mark as done');
    }
  };

  const handleUndo = async (streak) => {
    try {
      await undoStreakDone(streak.id, streak.completedDates || []);
      toast.success('Undone');
    } catch (error) {
      toast.error(error.message || 'Failed to undo');
    }
  };

  const handleDelete = async (streakId) => {
    if (!window.confirm('Are you sure you want to delete this streak?')) return;
    
    try {
      await deleteStreak(streakId);
      toast.success('Streak deleted');
    } catch (error) {
      console.error('Failed to delete streak:', error);
      toast.error('Failed to delete streak');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Streak</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Profile"
            >
              👤
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition hidden sm:block"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section with Quote */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome back{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}! 👋
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 italic"
          >
            &ldquo;{quote.text}&rdquo; — {quote.author}
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">{stats.currentStreak}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Streak 🔥</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-1">{stats.longestStreak}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Longest Streak 🏆</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">{stats.totalCompletions}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Completions ✅</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">{stats.completedToday}/{stats.totalStreaks}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Done Today 📅</div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['streaks', 'analytics', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'streaks' && '🎯 '}
              {tab === 'analytics' && '📊 '}
              {tab === 'calendar' && '📅 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Streaks Tab */}
          {activeTab === 'streaks' && (
            <motion.div
              key="streaks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Your Streaks
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
                >
                  + Add Streak
                </motion.button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : streaks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow"
                >
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                    No streaks yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first streak to start building habits!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
                  >
                    Create Your First Streak
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {streaks.map((streak, index) => (
                    <motion.div
                      key={streak.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <StreakCard
                        streak={streak}
                        isCompletedToday={isCompletedToday(streak.completedDates)}
                        onMarkDone={() => handleMarkDone(streak)}
                        onUndo={() => handleUndo(streak)}
                        onDelete={() => handleDelete(streak.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <ActivityHeatmap completionData={completionData} />
              
              {/* Streak Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span>🎯</span> Streak Performance
                </h3>
                
                {streaks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No streaks to analyze yet. Create your first streak to see analytics!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {streaks.map((streak) => (
                      <div key={streak.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {streak.title}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {streak.currentStreak} days
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((streak.currentStreak / (streak.longestStreak || 1)) * 100, 100)}%`
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Current: {streak.currentStreak}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Best: {streak.longestStreak || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span>📅</span> Calendar View
                </h3>
                <ActivityHeatmap completionData={completionData} />
                
                {/* Recent Activity */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Recent Activity
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(completionData)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 10)
                      .map(([date, count]) => (
                        <div
                          key={date}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="text-gray-700 dark:text-gray-300">{date}</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {count} completion{count !== 1 ? 's' : ''} ✅
                          </span>
                        </div>
                      ))}
                    {Object.keys(completionData).length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No activity yet. Start completing your streaks!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddStreakModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddStreak}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
