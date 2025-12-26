import { motion } from 'framer-motion';

export default function FirebaseErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          🔥
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Firebase Not Configured
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          The application requires Firebase to be properly configured. 
          Please set up your Firebase credentials in the environment variables.
        </p>
        
        <div className="bg-gray-800/50 rounded-xl p-6 text-left border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚙️</span> Required Environment Variables
          </h2>
          
          <ul className="space-y-2 text-sm font-mono text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_API_KEY
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_AUTH_DOMAIN
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_PROJECT_ID
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_STORAGE_BUCKET
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_MESSAGING_SENDER_ID
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              VITE_FIREBASE_APP_ID
            </li>
          </ul>
        </div>
        
        <p className="text-gray-500 text-sm mt-6">
          Create a <code className="text-orange-400">.env</code> file in the project root with your Firebase credentials.
        </p>
      </motion.div>
    </div>
  );
}
