import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import toast from 'react-hot-toast';
import { playNotificationSound } from './playNotificationSound';

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

let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

interface Bill {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: Date | Timestamp;
  status: 'paid' | 'pending' | 'overdue';
}

let lastNotificationTime: { [key: string]: number } = {};

// Helper function to check if a bill needs notification
const shouldNotifyForBill = (bill: Bill) => {
  // Don't notify for paid bills
  if (bill.status === 'paid') return false;

  const dueDate = bill.dueDate instanceof Timestamp ? bill.dueDate.toDate() : new Date(bill.dueDate);
  const today = new Date();
  const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // Notify for bills:
  // 1. Due tomorrow
  // 2. Due today
  // 3. Overdue
  return daysDiff <= 1 || daysDiff < 0;
};

// Helper function to create bill notifications
export const createBillNotification = async (userId: string, bill: Bill) => {
  try {
    if (!shouldNotifyForBill(bill)) return;

    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const dueDate = bill.dueDate instanceof Timestamp ? bill.dueDate.toDate() : new Date(bill.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    // Check if we've shown a notification for this bill recently (within 12 hours)
    const now = Date.now();
    const lastTime = lastNotificationTime[bill.id] || 0;
    if (now - lastTime < 12 * 60 * 60 * 1000) {
      return;
    }

    let notification = null;

    // Create notification for bills due tomorrow
    if (daysDiff === 1 && bill.status === 'pending') {
      notification = {
        title: 'Bill Due Tomorrow',
        message: `${bill.title} is due tomorrow (${bill.amount} ${bill.currency})`,
        type: 'warning' as const,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true,
        category: 'bill',
        priority: 'medium'
      };
    }

    // Create notification for bills due today
    else if (daysDiff === 0 && bill.status === 'pending') {
      notification = {
        title: 'Bill Due Today',
        message: `${bill.title} is due today (${bill.amount} ${bill.currency})`,
        type: 'error' as const,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true,
        category: 'bill',
        priority: 'high'
      };
    }

    // Create notification for overdue bills
    else if (daysDiff < 0 && bill.status === 'pending') {
      notification = {
        title: 'Overdue Bill',
        message: `${bill.title} was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`,
        type: 'error' as const,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true,
        category: 'bill',
        priority: 'high'
      };
    }

    if (notification) {
      // Check if a similar notification already exists
      const existingQuery = query(
        notificationsRef,
        where('billId', '==', bill.id),
        where('read', '==', false),
        limit(1)
      );
      
      const existingDocs = await getDocs(existingQuery);
      
      if (existingDocs.empty) {
        await addDoc(notificationsRef, notification);
        lastNotificationTime[bill.id] = now;
        
        // Play notification sound
        playNotificationSound();
        
        // Show toast notification
        toast(notification.message, {
          duration: 5000,
          icon: notification.type === 'warning' ? '⚠️' : '🚨'
        });
      }
    }
  } catch (error) {
    console.error('Error creating bill notification:', error);
  }
};

// Helper function to check and update bill notifications
export const checkBillNotifications = async (userId: string) => {
  try {
    const billsRef = collection(db, 'users', userId, 'bills');
    const billsQuery = query(
      billsRef,
      where('status', '!=', 'paid'),
      orderBy('status'),
      orderBy('dueDate')
    );

    const snapshot = await getDocs(billsQuery);
    const bills = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Bill[];

    // Create notifications for each relevant bill
    await Promise.all(bills.map(bill => createBillNotification(userId, bill)));
  } catch (error) {
    console.error('Error checking bill notifications:', error);
  }
};

// Helper function to mark notification as read and confirmed
export const confirmNotification = async (userId: string, notificationId: string, billId?: string) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      confirmed: true,
      confirmedAt: new Date()
    });

    // Update the bill to mark it as acknowledged
    if (billId) {
      const billRef = doc(db, 'users', userId, 'bills', billId);
      await updateDoc(billRef, {
        lastNotificationAcknowledged: true,
        lastAcknowledgedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error confirming notification:', error);
    throw error;
  }
};

export { analytics };