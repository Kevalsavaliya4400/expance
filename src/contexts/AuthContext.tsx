import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Initialize user document and settings if they don't exist
        await initializeUserData(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function initializeUserData(user: User) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document
        await setDoc(userRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Initialize settings
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await setDoc(settingsRef, {
          currency: 'USD',
          theme: 'light',
          notifications: {
            email: true,
            push: false
          },
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before signing in.');
    }
  };

  const signUp = async (email: string, password: string, profile: any) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Initialize user data
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, {
      ...profile,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Initialize settings
    const settingsRef = doc(db, 'users', result.user.uid, 'settings', 'preferences');
    await setDoc(settingsRef, {
      currency: 'USD',
      theme: 'light',
      notifications: {
        email: true,
        push: false
      },
      createdAt: serverTimestamp()
    });

    await sendEmailVerification(result.user);
    await signOut(auth);
  };

  const logout = () => signOut(auth);

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  const verifyEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  };

  const value = {
    currentUser,
    signIn,
    signUp,
    logout,
    resetPassword,
    verifyEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}