import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth, firebaseConfigError } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  // If Firebase is not configured, loading should start as false
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !firebaseConfigError && auth !== null);

  useEffect(() => {
    // Skip if Firebase is not configured or auth is null
    if (firebaseConfigError || !auth) {
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (firebaseConfigError || !auth) {
      throw { code: 'auth/configuration-error', message: 'Firebase is not configured' };
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    if (firebaseConfigError || !auth) {
      throw { code: 'auth/configuration-error', message: 'Firebase is not configured' };
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (firebaseConfigError || !auth) {
      throw { code: 'auth/configuration-error', message: 'Firebase is not configured' };
    }
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    firebaseConfigError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
