import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  subscribeToStreaks, 
  createStreak, 
  markStreakDone, 
  undoStreakDone, 
  deleteStreak,
  isCompletedToday 
} from '../services/streakService';
import StreakCard from '../components/StreakCard';
import AddStreakModal from '../components/AddStreakModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToStreaks(user.uid, (data) => {
      setStreaks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddStreak = async (title) => {
    try {
      await createStreak(user.uid, title);
      toast.success('Streak created!');
      setShowAddModal(false);
    } catch {
      toast.error('Failed to create streak');
    }
  };

  const handleMarkDone = async (streak) => {
    try {
      await markStreakDone(streak.id, streak.completedDates || []);
      toast.success('Great job! Keep it up! 🔥');
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
    } catch {
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
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Streak</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Your Streaks
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
          >
            + Add Streak
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : streaks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
              No streaks yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first streak to start building habits!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
            >
              Create Your First Streak
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {streaks.map(streak => (
              <StreakCard
                key={streak.id}
                streak={streak}
                isCompletedToday={isCompletedToday(streak.completedDates)}
                onMarkDone={() => handleMarkDone(streak)}
                onUndo={() => handleUndo(streak)}
                onDelete={() => handleDelete(streak.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <AddStreakModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStreak}
        />
      )}
    </div>
  );
}
