import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, firebaseConfigError } from './firebase';

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
  
  // Streak is active if user completed today OR yesterday
  // If user missed today but completed yesterday, streak is still active (they have until end of today)
  const mostRecentDate = sortedDates[0];
  
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    // Last completion was more than 1 day ago - streak is broken
    return 0;
  }
  
  let streak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    // Calculate the expected previous date
    const prevExpectedDate = getDateStringDaysAgo(
      mostRecentDate === today 
        ? i 
        : i + 1 // offset by 1 if starting from yesterday
    );
    
    if (sortedDates[i] === prevExpectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateLongestStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort();
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    
    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // If diffDays === 0, it's a duplicate, skip
  }
  
  return longestStreak;
}

export function subscribeToStreaks(userId, callback) {
  if (firebaseConfigError || !db) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const streaks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      currentStreak: calculateCurrentStreak(doc.data().completedDates),
      longestStreak: calculateLongestStreak(doc.data().completedDates)
    }));
    callback(streaks);
  }, (error) => {
    console.error('Error fetching streaks:', error);
    callback([]);
  });
}

export async function createStreak(userId, title) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title,
    completedDates: [],
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function markStreakDone(streakId, completedDates) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  const today = getLocalDateString();
  
  if (completedDates.includes(today)) {
    throw new Error('Already completed today');
  }
  
  const newDates = [...completedDates, today];
  
  await updateDoc(doc(db, COLLECTION_NAME, streakId), {
    completedDates: newDates
  });
}

export async function undoStreakDone(streakId, completedDates) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  const today = getLocalDateString();
  
  if (!completedDates.includes(today)) {
    throw new Error('Not completed today');
  }
  
  const newDates = completedDates.filter(date => date !== today);
  
  await updateDoc(doc(db, COLLECTION_NAME, streakId), {
    completedDates: newDates
  });
}

export async function deleteStreak(streakId) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  await deleteDoc(doc(db, COLLECTION_NAME, streakId));
}

export function isCompletedToday(completedDates) {
  const today = getLocalDateString();
  return completedDates && completedDates.includes(today);
}
