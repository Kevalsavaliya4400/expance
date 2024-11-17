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
    
    function isValidAmount(amount) {
      return amount is number && amount > 0;
    }
    
    function isValidDate(date) {
      return date is timestamp;
    }
    
    // User document rules
    match /users/{userId} {
      allow create: if isSignedIn() && isOwner(userId);
      allow read, update: if isSignedIn() && isOwner(userId);
      allow delete: if false; // Prevent user deletion through client
      
      // Transactions subcollection
      match /transactions/{transactionId} {
        allow create: if isSignedIn() && 
                     isOwner(userId) && 
                     isValidAmount(request.resource.data.amount) &&
                     isValidDate(request.resource.data.createdAt);
        allow read, update, delete: if isSignedIn() && isOwner(userId);
      }
      
      // Settings subcollection
      match /settings/{settingId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
      
      // Bills subcollection
      match /bills/{billId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }
  }
}
*/

// Required indexes for queries
/*
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bills",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
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