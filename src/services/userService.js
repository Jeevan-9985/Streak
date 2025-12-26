import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

/**
 * Create or update user profile in Firestore
 */
export async function createUserProfile(uid, data) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user profile
    await setDoc(userRef, {
      email: data.email,
      displayName: data.displayName || '',
      photoURL: data.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        totalStreaks: 0
      }
    });
  }
  
  return userRef;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  
  return null;
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Update user stats in Firestore
 */
export async function updateUserStats(uid, stats) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    stats: stats,
    updatedAt: serverTimestamp()
  });
}

/**
 * Calculate and update aggregated user stats from all streaks
 */
export function calculateUserStats(streaks) {
  let totalCompletions = 0;
  let longestStreak = 0;
  let currentMaxStreak = 0;
  
  streaks.forEach(streak => {
    totalCompletions += (streak.completedDates || []).length;
    
    if (streak.longestStreak > longestStreak) {
      longestStreak = streak.longestStreak;
    }
    
    if (streak.currentStreak > currentMaxStreak) {
      currentMaxStreak = streak.currentStreak;
    }
  });
  
  return {
    currentStreak: currentMaxStreak,
    longestStreak,
    totalCompletions,
    totalStreaks: streaks.length
  };
}
