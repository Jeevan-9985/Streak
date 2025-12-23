import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext();

const LOCAL_STORAGE_USER_KEY = 'streak_app_user';
const LOCAL_STORAGE_USERS_KEY = 'streak_app_users';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Local storage auth functions for demo mode
function getLocalUsers() {
  const users = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  return users ? JSON.parse(users) : {};
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

function getLocalUser() {
  const user = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function saveLocalUser(user) {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}

// Initialize user state based on mode
function getInitialUser() {
  if (!isFirebaseConfigured) {
    return getLocalUser();
  }
  return null;
}

function getInitialLoading() {
  // In demo mode, we can load from localStorage immediately
  return isFirebaseConfigured;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(getInitialLoading);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    }
    // Demo mode: already initialized from localStorage in useState
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured) {
      return signInWithEmailAndPassword(auth, email, password);
    } else {
      // Demo mode: validate against localStorage
      const users = getLocalUsers();
      const user = users[email];
      if (!user || user.password !== password) {
        throw { code: 'auth/invalid-credential' };
      }
      const userObj = { uid: user.uid, email: user.email };
      setUser(userObj);
      saveLocalUser(userObj);
      return { user: userObj };
    }
  };

  const signup = async (email, password) => {
    if (isFirebaseConfigured) {
      return createUserWithEmailAndPassword(auth, email, password);
    } else {
      // Demo mode: save to localStorage
      const users = getLocalUsers();
      if (users[email]) {
        throw { code: 'auth/email-already-in-use' };
      }
      const uid = 'local_' + Date.now();
      users[email] = { uid, email, password };
      saveLocalUsers(users);
      const userObj = { uid, email };
      setUser(userObj);
      saveLocalUser(userObj);
      return { user: userObj };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      return signOut(auth);
    } else {
      setUser(null);
      saveLocalUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isDemo: !isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
