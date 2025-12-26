import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured, resetPassword } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  // Initialize loading based on whether Firebase is configured
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create user profile in Firestore
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || ''
            });
            profile = await getUserProfile(firebaseUser.uid);
          }
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName = '') => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    // Create user profile in Firestore
    await createUserProfile(result.user.uid, {
      email: result.user.email,
      displayName: displayName || '',
      photoURL: ''
    });
    
    return result;
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    // Clear user profile first
    setUserProfile(null);
    return signOut(auth);
  };

  const forgotPassword = async (email) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    return resetPassword(email);
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
