import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, Timestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from './types';
import NotificationBadge from './NotificationBadge';
import NotificationList from './NotificationList';
import { Filter, Check } from 'lucide-react';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'bills' | 'system'>('all');
  const { currentUser } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    let q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    // Apply filters
    if (filter === 'unread') {
      q = query(q, where('read', '==', false));
    } else if (filter === 'bills') {
      q = query(q, where('billId', '!=', null));
    } else if (filter === 'system') {
      q = query(q, where('billId', '==', null));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
        };
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser, filter]);

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Update notification status
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { 
        read: true,
        confirmedAt: new Date()
      });

      // If it's a bill notification, navigate to bills page
      if (notification.billId) {
        navigate(`/bills?highlight=${notification.billId}`);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(
            doc(db, 'users', currentUser.uid, 'notifications', n.id),
            { 
              read: true,
              confirmedAt: new Date()
            }
          )
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBadge
        count={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {(['all', 'unread', 'bills', 'system'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === f
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
          />
        </div>
      )}
    </div>
  );
}