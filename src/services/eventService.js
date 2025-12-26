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
  orderBy
} from 'firebase/firestore';
import { db, firebaseConfigError } from './firebase';

const COLLECTION_NAME = 'events';

export function subscribeToEvents(userId, callback) {
  if (firebaseConfigError || !db) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  }, (error) => {
    console.error('Error fetching events:', error);
    callback([]);
  });
}

export async function createEvent(userId, eventData) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title: eventData.title,
    description: eventData.description || '',
    date: eventData.date,
    color: eventData.color || 'blue',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateEvent(eventId, eventData) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  await updateDoc(doc(db, COLLECTION_NAME, eventId), {
    title: eventData.title,
    description: eventData.description || '',
    date: eventData.date,
    color: eventData.color || 'blue',
    updatedAt: serverTimestamp()
  });
}

export async function deleteEvent(eventId) {
  if (firebaseConfigError || !db) {
    throw new Error('Firebase is not configured');
  }
  
  await deleteDoc(doc(db, COLLECTION_NAME, eventId));
}
