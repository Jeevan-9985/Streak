import { motion } from 'framer-motion';

export default function StreakCard({ streak, isCompletedToday, onMarkDone, onUndo, onDelete }) {
  return (
    <motion.article
      layout
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
      aria-label={`Streak: ${streak.title}, Current streak: ${streak.currentStreak} days`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 break-words pr-2">
          {streak.title}
        </h3>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          aria-label={`Delete streak: ${streak.title}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4" aria-label={`${streak.currentStreak} day streak`}>
        <motion.span
          key={streak.currentStreak}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-orange-500"
          aria-hidden="true"
        >
          {streak.currentStreak}
        </motion.span>
        <span className="text-gray-600 dark:text-gray-400">
          day{streak.currentStreak !== 1 ? 's' : ''} 🔥
        </span>
      </div>

      {/* Best Streak */}
      {streak.longestStreak > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4" aria-label={`Best streak: ${streak.longestStreak} days`}>
          🏆 Best: {streak.longestStreak} days
        </div>
      )}

      <div className="flex gap-2" role="group" aria-label="Streak actions">
        {isCompletedToday ? (
          <>
            <motion.button
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              disabled
              className="flex-1 py-2 px-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Already completed today"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              className="py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label={`Undo today's completion for ${streak.title}`}
            >
              Undo
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onMarkDone}
            className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label={`Mark ${streak.title} as done for today`}
          >
            Mark Done ✓
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
