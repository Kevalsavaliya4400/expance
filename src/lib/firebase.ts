import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, orderBy, limit, Timestamp, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
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

// Store notification timestamps in memory
const notificationTimestamps = new Map<string, number>();

// Helper function to check if a notification should be shown
const shouldShowNotification = (billId: string, type: string): boolean => {
  const key = `${billId}-${type}`;
  const now = Date.now();
  const lastShown = notificationTimestamps.get(key) || 0;
  const minInterval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  if (now - lastShown >= minInterval) {
    notificationTimestamps.set(key, now);
    return true;
  }

  return false;
};

// Helper function to check for existing notifications
const hasExistingNotification = async (userId: string, billId: string, type: string): Promise<boolean> => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  
  const q = query(
    notificationsRef,
    where('billId', '==', billId),
    where('type', '==', type),
    where('createdAt', '>=', twelveHoursAgo),
    limit(1)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Helper function to create bill notifications
export const createBillNotification = async (userId: string, bill: Bill) => {
  try {
    const dueDate = bill.dueDate instanceof Timestamp ? bill.dueDate.toDate() : new Date(bill.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    let notification = null;
    let notificationType = '';

    // Create notification for bills due tomorrow
    if (daysDiff === 1 && bill.status === 'pending') {
      notificationType = 'due-tomorrow';
      if (await hasExistingNotification(userId, bill.id, notificationType)) {
        return;
      }

      notification = {
        title: 'Bill Due Tomorrow',
        message: `${bill.title} is due tomorrow (${bill.amount} ${bill.currency})`,
        type: 'warning' as const,
        notificationType,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true
      };
    }

    // Create notification for bills due today
    else if (daysDiff === 0 && bill.status === 'pending') {
      notificationType = 'due-today';
      if (await hasExistingNotification(userId, bill.id, notificationType)) {
        return;
      }

      notification = {
        title: 'Bill Due Today',
        message: `${bill.title} is due today (${bill.amount} ${bill.currency})`,
        type: 'error' as const,
        notificationType,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true
      };
    }

    // Create notification for overdue bills
    else if (daysDiff < 0 && bill.status === 'pending') {
      notificationType = 'overdue';
      if (await hasExistingNotification(userId, bill.id, notificationType)) {
        return;
      }

      notification = {
        title: 'Overdue Bill',
        message: `${bill.title} was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`,
        type: 'error' as const,
        notificationType,
        read: false,
        createdAt: new Date(),
        billId: bill.id,
        dueDate: bill.dueDate,
        requiresConfirmation: true
      };
    }

    if (notification && shouldShowNotification(bill.id, notificationType)) {
      const notificationsRef = collection(db, 'users', userId, 'notifications');
      await addDoc(notificationsRef, notification);
      
      // Play notification sound
      playNotificationSound();
      
      // Show toast notification
      toast(notification.message, {
        duration: 5000,
        icon: notification.type === 'warning' ? '⚠️' : '🚨'
      });

      // Update bill's last notification timestamp
      const billRef = doc(db, 'users', userId, 'bills', bill.id);
      await updateDoc(billRef, {
        lastNotificationSent: new Date(),
        lastNotificationType: notificationType
      });
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