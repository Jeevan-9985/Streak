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
import { db } from './firebase';

const COLLECTION_NAME = 'streaks';

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
  let currentDate = new Date(today);
  
  for (let i = 1; i < sortedDates.length; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function subscribeToStreaks(userId, callback) {
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
}

export async function createStreak(userId, title) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title,
    completedDates: [],
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function markStreakDone(streakId, completedDates) {
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
  await deleteDoc(doc(db, COLLECTION_NAME, streakId));
}

export function isCompletedToday(completedDates) {
  const today = getLocalDateString();
  return completedDates && completedDates.includes(today);
}
