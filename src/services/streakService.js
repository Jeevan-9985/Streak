import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const COLLECTION_NAME = 'streaks';

export function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateStringDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateCurrentStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort().reverse();
  const today = getLocalDateString();
  const yesterday = getDateStringDaysAgo(1);
  
  // Streak is valid if most recent completion is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  // If most recent is today, calculate from today (offset 0)
  // If most recent is yesterday, calculate from yesterday (offset -1)
  const dayOffset = sortedDates[0] === today ? 0 : -1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = getDateStringDaysAgo(i + dayOffset);
    
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function subscribeToStreaks(userId, callback) {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const streaks = snapshot.docs.map(doc => {
      const data = doc.data();
      const currentStreak = calculateCurrentStreak(data.completedDates);
      return {
        id: doc.id,
        ...data,
        currentStreak,
        // Update longestStreak if currentStreak exceeds it
        longestStreak: Math.max(data.longestStreak || 0, currentStreak)
      };
    });
    callback(streaks);
  }, (error) => {
    console.error('Error subscribing to streaks:', error);
    callback([]);
  });
}

export async function createStreak(userId, title) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title,
    completedDates: [],
    longestStreak: 0,
    totalCompletions: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function markStreakDone(streakId, completedDates) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const today = getLocalDateString();
  
  if (completedDates.includes(today)) {
    throw new Error('Already completed today');
  }
  
  const newDates = [...completedDates, today];
  const newCurrentStreak = calculateCurrentStreak(newDates);
  
  // Get current streak doc to update longestStreak
  const streakRef = doc(db, COLLECTION_NAME, streakId);
  const streakSnap = await getDoc(streakRef);
  const currentData = streakSnap.data();
  const newLongestStreak = Math.max(currentData?.longestStreak || 0, newCurrentStreak);
  
  await updateDoc(streakRef, {
    completedDates: newDates,
    longestStreak: newLongestStreak,
    totalCompletions: newDates.length,
    updatedAt: serverTimestamp()
  });
}

export async function undoStreakDone(streakId, completedDates) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const today = getLocalDateString();
  
  if (!completedDates.includes(today)) {
    throw new Error('Not completed today');
  }
  
  const newDates = completedDates.filter(date => date !== today);
  
  await updateDoc(doc(db, COLLECTION_NAME, streakId), {
    completedDates: newDates,
    totalCompletions: newDates.length,
    updatedAt: serverTimestamp()
  });
}

export async function deleteStreak(streakId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  await deleteDoc(doc(db, COLLECTION_NAME, streakId));
}

export function isCompletedToday(completedDates) {
  const today = getLocalDateString();
  return completedDates && completedDates.includes(today);
}

/**
 * Get all completion dates across all streaks for a user (for heatmap)
 */
export function getAllCompletionDates(streaks) {
  const dateCountMap = {};
  
  streaks.forEach(streak => {
    (streak.completedDates || []).forEach(date => {
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });
  });
  
  return dateCountMap;
}
