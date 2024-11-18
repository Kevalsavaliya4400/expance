import { formatDistanceToNow, format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Notification } from './types';
import NotificationIcon from './NotificationIcon';
import { Check } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getNotificationDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const getBackgroundColor = () => {
    if (!notification.read) {
      switch (notification.type) {
        case 'warning':
          return 'bg-yellow-50 dark:bg-yellow-900/20';
        case 'error':
          return 'bg-red-50 dark:bg-red-900/20';
        case 'success':
          return 'bg-green-50 dark:bg-green-900/20';
        default:
          return 'bg-blue-50 dark:bg-blue-900/20';
      }
    }
    return '';
  };

  return (
    <div
      className={`group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${getBackgroundColor()}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm truncate">{notification.title}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {getNotificationDate(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          {notification.dueDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Due: {format(notification.dueDate instanceof Timestamp ? notification.dueDate.toDate() : notification.dueDate, 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>
      
      {notification.requiresConfirmation && !notification.read && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}