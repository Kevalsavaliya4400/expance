import { Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Timestamp | Date;
  billId?: string;
  dueDate?: Timestamp | Date;
  requiresConfirmation?: boolean;
}