import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition duration-200 relative"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-700 dark:text-white" />
      {count > 0 && (
        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}