import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAVUZwM655wE0jtiF4uiZNGyeWfRECAK1g",
  authDomain: "expense-tracker-81a37.firebaseapp.com",
  projectId: "expense-tracker-81a37",
  storageBucket: "expense-tracker-81a37.firebasestorage.app",
  messagingSenderId: "329138414472",
  appId: "1:329138414472:web:85e2c8fb80b9db6101503d",
  measurementId: "G-K7LKZNMTYK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only if supported
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Firestore security rules
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // User profile and settings
    match /users/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);
      
      // Transactions collection
      match /transactions/{transactionId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
      
      // Settings collection
      match /settings/{settingId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
      
      // Bills collection
      match /bills/{billId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
      
      // Payment methods collection
      match /payment/{document=**} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }
  }
}
*/

export { analytics };

// Helper functions for Firestore operations
export const getUserTransactions = async (userId: string, type?: 'income' | 'expense') => {
  if (!userId) return [];
  
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    let q = query(
      transactionsRef,
      orderBy('date', 'desc'),
      limit(50)
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getUserSettings = async (userId: string) => {
  if (!userId) return {};
  
  try {
    const settingsRef = collection(db, 'users', userId, 'settings');
    const snapshot = await getDocs(settingsRef);
    return snapshot.docs[0]?.data() || {};
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return {};
  }
};