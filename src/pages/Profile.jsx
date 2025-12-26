import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserProfile } from '../services/userService';
import { subscribeToStreaks, getAllCompletionDates } from '../services/streakService';
import { generateStreakReport } from '../services/pdfService';
import ActivityHeatmap from '../components/ActivityHeatmap';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { user, userProfile, logout, refreshUserProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [streaks, setStreaks] = useState([]);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToStreaks(user.uid, (data) => {
      setStreaks(data);
      setLoadingStreaks(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    if (streaks.length === 0) {
      return {
        totalStreaks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0
      };
    }

    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;
    let totalCompletions = 0;

    streaks.forEach(streak => {
      if (streak.currentStreak > maxCurrentStreak) {
        maxCurrentStreak = streak.currentStreak;
      }
      if (streak.longestStreak > maxLongestStreak) {
        maxLongestStreak = streak.longestStreak;
      }
      totalCompletions += (streak.completedDates || []).length;
    });

    return {
      totalStreaks: streaks.length,
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
      totalCompletions
    };
  }, [streaks]);

  const completionData = useMemo(() => {
    return getAllCompletionDates(streaks);
  }, [streaks]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      await refreshUserProfile();
      setEditing(false);
      toast.success('Profile updated! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setGeneratingPDF(true);
    try {
      await generateStreakReport(userProfile, streaks, completionData);
      toast.success('PDF report downloaded! 📄');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const joinedDate = userProfile?.createdAt?.toDate?.() || new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                {displayName ? displayName[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || '👤'}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setDisplayName(userProfile?.displayName || '');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {displayName || 'Anonymous User'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      📅 Joined {format(joinedDate, 'MMMM d, yyyy')}
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        ✏️ Edit Profile
                      </button>
                      <button
                        onClick={handleExportPDF}
                        disabled={generatingPDF}
                        className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition"
                      >
                        {generatingPDF ? '📄 Generating...' : '📄 Export PDF'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center"
            >
              <div className="text-3xl font-bold text-orange-500 mb-1">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak 🔥</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center"
            >
              <div className="text-3xl font-bold text-purple-500 mb-1">{stats.longestStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak 🏆</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center"
            >
              <div className="text-3xl font-bold text-green-500 mb-1">{stats.totalCompletions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Completions ✅</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center"
            >
              <div className="text-3xl font-bold text-blue-500 mb-1">{stats.totalStreaks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Streaks 🎯</div>
            </motion.div>
          </div>

          {/* Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {loadingStreaks ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            ) : (
              <ActivityHeatmap completionData={completionData} />
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
