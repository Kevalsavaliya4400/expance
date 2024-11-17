import { Toast } from 'react-hot-toast';
import { Bell, AlertCircle, Check, Clock } from 'lucide-react';

interface NotificationToastProps {
  t: Toast;
  message: string;
  type?: 'warning' | 'error' | 'success' | 'info';
}

export default function NotificationToast({ t, message, type = 'info' }: NotificationToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <Clock className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <Check className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-500';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-500';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-500';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-500';
    }
  };

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 border-l-4 ${getStyles()}`}
    >
      {getIcon()}
      <p className="font-medium">{message}</p>
    </div>
  );
}