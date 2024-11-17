import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Notification } from './types';
import NotificationIcon from './NotificationIcon';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getNotificationDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />
        <div className="flex-1">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {getNotificationDate(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}