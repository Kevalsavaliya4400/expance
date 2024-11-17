import { Check, Clock, X } from 'lucide-react';
import { Notification } from './types';

interface NotificationIconProps {
  type: Notification['type'];
}

export default function NotificationIcon({ type }: NotificationIconProps) {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'warning':
    case 'error':
      return <X className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-blue-500" />;
  }
}