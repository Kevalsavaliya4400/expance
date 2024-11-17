export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export const TRANSACTION_CATEGORIES = {
  [TRANSACTION_TYPES.INCOME]: [
    { id: 'salary', name: 'Salary', icon: '💰' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'investments', name: 'Investments', icon: '📈' },
    { id: 'business', name: 'Business', icon: '🏢' },
    { id: 'rental', name: 'Rental Income', icon: '🏠' },
    { id: 'other_income', name: 'Other Income', icon: '💵' },
  ],
  [TRANSACTION_TYPES.EXPENSE]: [
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'utilities', name: 'Bills & Utilities', icon: '📱' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'rent', name: 'Rent/Mortgage', icon: '🏠' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'other', name: 'Other', icon: '📌' },
  ],
} as const;