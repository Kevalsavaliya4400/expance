export const BILL_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;

export const BILL_CATEGORIES = [
  { id: 'utilities', name: 'Utilities', icon: '⚡️' },
  { id: 'rent', name: 'Rent/Mortgage', icon: '🏠' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'phone', name: 'Phone/Internet', icon: '📱' },
  { id: 'subscription', name: 'Subscriptions', icon: '📺' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'loan', name: 'Loan Payment', icon: '🏦' },
  { id: 'other', name: 'Other', icon: '📝' },
] as const;

export const BILL_FREQUENCIES = [
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' },
  { id: 'one_time', name: 'One Time' },
] as const;