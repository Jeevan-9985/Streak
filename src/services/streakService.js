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
import { db, isFirebaseConfigured } from './firebase';

const COLLECTION_NAME = 'streaks';
const LOCAL_STORAGE_STREAKS_KEY = 'streak_app_streaks';

// Local storage helpers
function getLocalStreaks() {
  const streaks = localStorage.getItem(LOCAL_STORAGE_STREAKS_KEY);
  return streaks ? JSON.parse(streaks) : [];
}

function saveLocalStreaks(streaks) {
  localStorage.setItem(LOCAL_STORAGE_STREAKS_KEY, JSON.stringify(streaks));
}

export function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateCurrentStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort().reverse();
  const today = getLocalDateString();
  
  if (sortedDates[0] !== today) {
    return 0;
  }
  
  let streak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    // Calculate expected previous date by subtracting days from today
    const expectedDate = getDateStringDaysAgo(i);
    
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getDateStringDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function subscribeToStreaks(userId, callback) {
  if (isFirebaseConfigured) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const streaks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        currentStreak: calculateCurrentStreak(doc.data().completedDates)
      }));
      callback(streaks);
    });
  } else {
    // Demo mode: use localStorage
    const streaks = getLocalStreaks()
      .filter(s => s.userId === userId)
      .map(s => ({
        ...s,
        currentStreak: calculateCurrentStreak(s.completedDates)
      }));
    callback(streaks);
    
    // Return a function to trigger updates (for localStorage mode)
    const intervalId = setInterval(() => {
      const updatedStreaks = getLocalStreaks()
        .filter(s => s.userId === userId)
        .map(s => ({
          ...s,
          currentStreak: calculateCurrentStreak(s.completedDates)
        }));
      callback(updatedStreaks);
    }, 500);
    
    return () => clearInterval(intervalId);
  }
}

export async function createStreak(userId, title) {
  if (isFirebaseConfigured) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      title,
      completedDates: [],
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } else {
    // Demo mode: save to localStorage
    const streaks = getLocalStreaks();
    const id = 'local_' + Date.now();
    streaks.push({
      id,
      userId,
      title,
      completedDates: [],
      createdAt: new Date().toISOString()
    });
    saveLocalStreaks(streaks);
    return id;
  }
}

export async function markStreakDone(streakId, completedDates) {
  const today = getLocalDateString();
  
  if (completedDates.includes(today)) {
    throw new Error('Already completed today');
  }
  
  const newDates = [...completedDates, today];
  
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, COLLECTION_NAME, streakId), {
      completedDates: newDates
    });
  } else {
    // Demo mode: update localStorage
    const streaks = getLocalStreaks();
    const index = streaks.findIndex(s => s.id === streakId);
    if (index !== -1) {
      streaks[index].completedDates = newDates;
      saveLocalStreaks(streaks);
    }
  }
}

export async function undoStreakDone(streakId, completedDates) {
  const today = getLocalDateString();
  
  if (!completedDates.includes(today)) {
    throw new Error('Not completed today');
  }
  
  const newDates = completedDates.filter(date => date !== today);
  
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, COLLECTION_NAME, streakId), {
      completedDates: newDates
    });
  } else {
    // Demo mode: update localStorage
    const streaks = getLocalStreaks();
    const index = streaks.findIndex(s => s.id === streakId);
    if (index !== -1) {
      streaks[index].completedDates = newDates;
      saveLocalStreaks(streaks);
    }
  }
}

export async function deleteStreak(streakId) {
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db, COLLECTION_NAME, streakId));
  } else {
    // Demo mode: remove from localStorage
    const streaks = getLocalStreaks();
    const filtered = streaks.filter(s => s.id !== streakId);
    saveLocalStreaks(filtered);
  }
}

export function isCompletedToday(completedDates) {
  const today = getLocalDateString();
  return completedDates && completedDates.includes(today);
}
