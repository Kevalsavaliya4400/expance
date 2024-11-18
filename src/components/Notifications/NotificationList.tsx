import { useMemo } from 'react';
import { Notification } from './types';
import NotificationItem from './NotificationItem';
import { groupBy } from 'lodash';
import { format } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  const groupedNotifications = useMemo(() => {
    const groups = groupBy(notifications, (notification) => {
      const date = notification.createdAt instanceof Date 
        ? notification.createdAt 
        : notification.createdAt.toDate();
      return format(date, 'yyyy-MM-dd');
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🔔</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No notifications yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
          We'll notify you when something important happens
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
      {groupedNotifications.map(([date, items]) => (
        <div key={date} className="bg-gray-50 dark:bg-gray-800/50">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 sticky top-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {format(new Date(date), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onMarkAsRead(notification.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}