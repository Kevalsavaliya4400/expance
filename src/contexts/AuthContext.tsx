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
import { db, auth } from '../lib/firebase'; // Import Firestore db
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions for reading/writing data

interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserProfile: (
    displayName: string,
    profileImage: string | null
  ) => Promise<void>; // Add profile update function
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign In
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign Up
  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await sendEmailVerification(result.user);
    }
  };

  // Logout
  const logout = () => signOut(auth);

  // Reset Password
  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  // Verify Email
  const verifyEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  // Update Profile Data in Firestore
  const updateUserProfile = async (
    displayName: string,
    profileImage: string | null
  ) => {
    if (!currentUser) {
      throw new Error('User is not logged in');
    }

    const userRef = doc(db, 'users', currentUser.uid); // Firestore reference to the user's document
    const updatedProfile = {
      displayName,
      profileImage: profileImage || currentUser.photoURL, // Use current photo URL if no new image
    };

    try {
      await setDoc(userRef, updatedProfile, { merge: true }); // Update the user document in Firestore
    } catch (error) {
      console.error('Error updating user profile in Firestore:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    signIn,
    signUp,
    logout,
    resetPassword,
    verifyEmail,
    updateUserProfile, // Expose the update profile function
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
