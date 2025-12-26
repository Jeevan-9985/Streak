import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration - all required fields must be present
const isValidConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain &&
  !firebaseConfig.apiKey.includes('your_') &&
  !firebaseConfig.projectId.includes('your_')
);

if (!isValidConfig) {
  console.error('Firebase configuration is missing or invalid. Please set up your Firebase environment variables.');
}

// Initialize Firebase - throws error if config is invalid
const app = isValidConfig ? initializeApp(firebaseConfig) : null;
const auth = isValidConfig ? getAuth(app) : null;
const db = isValidConfig ? getFirestore(app) : null;

// Export configuration status for error display
export const firebaseConfigError = !isValidConfig;

export { auth, db };
