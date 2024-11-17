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
import { db, auth, checkBillNotifications } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { playNotificationSound } from '../lib/playNotificationSound';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  securityQuestion: string;
  securityAnswer: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'email' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for pending notifications
  const checkPendingNotifications = async (userId: string) => {
    try {
      // Check bill notifications first
      await checkBillNotifications(userId);

      // Get unread notifications
      const notificationsRef = collection(db, 'users', userId, 'notifications');
      const q = query(
        notificationsRef,
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const unreadNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If there are unread notifications, show them in a popup
      if (unreadNotifications.length > 0) {
        playNotificationSound();
        
        // Show the most recent notification as a toast
        const mostRecent = unreadNotifications[0];
        toast(
          <div className="space-y-2">
            <p className="font-medium">{mostRecent.title}</p>
            <p className="text-sm">{mostRecent.message}</p>
            {unreadNotifications.length > 1 && (
              <p className="text-sm text-gray-500">
                +{unreadNotifications.length - 1} more notifications
              </p>
            )}
          </div>,
          {
            duration: 5000,
            icon: mostRecent.type === 'warning' ? '⚠️' : 
                  mostRecent.type === 'error' ? '🚨' : 
                  mostRecent.type === 'success' ? '✅' : 'ℹ️'
          }
        );
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
        // Check notifications immediately after login
        await checkPendingNotifications(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before signing in.');
      }
      await fetchUserProfile(result.user.uid);
      // Check notifications immediately after successful login
      await checkPendingNotifications(result.user.uid);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profile: Omit<UserProfile, 'email' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      const userProfile: UserProfile = {
        ...profile,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), userProfile);

      // Create initial settings
      await setDoc(doc(db, 'users', result.user.uid, 'settings', 'preferences'), {
        currency: 'USD',
        theme: 'light',
        notifications: {
          email: true,
          push: false
        },
        createdAt: new Date()
      });

      // Send verification email
      await sendEmailVerification(result.user);

      // Sign out the user after registration
      await signOut(auth);

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use. Please use a different email.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      }
      throw error;
    }
  };

  const verifyEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser);
      } catch (error: any) {
        if (error.code === 'auth/too-many-requests') {
          throw new Error('Too many requests. Please try again later.');
        }
        throw error;
      }
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user is logged in');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedProfile = {
        ...profile,
        updatedAt: new Date(),
      };

      await setDoc(userRef, updatedProfile, { merge: true });
      await fetchUserProfile(currentUser.uid);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    signIn,
    signUp,
    logout,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}