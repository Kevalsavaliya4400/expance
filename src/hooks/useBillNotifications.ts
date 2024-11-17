import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkBillNotifications } from '../lib/firebase';

export function useBillNotifications() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Check notifications when component mounts
    checkBillNotifications(currentUser.uid);

    // Set up interval to check notifications every 12 hours
    const interval = setInterval(() => {
      checkBillNotifications(currentUser.uid);
    }, 12 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser]);
}