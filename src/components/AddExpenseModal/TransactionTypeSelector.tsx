import { type } from 'os';

interface TransactionTypeSelectorProps {
  type: 'income' | 'expense';
  onChange: (type: 'income' | 'expense') => void;
}

export default function TransactionTypeSelector({ type, onChange }: TransactionTypeSelectorProps) {
  return (
    <div className="flex gap-4 mb-4">
      <button
        type="button"
        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
          type === 'income'
            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}
        onClick={() => onChange('income')}
      >
        Income
      </button>
      <button
        type="button"
        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
          type === 'expense'
            ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}
        onClick={() => onChange('expense')}
      >
        Expense
      </button>
    </div>
  );
}