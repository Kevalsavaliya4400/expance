import { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { currency, formatAmount } = useCurrency();

  const categories = {
    income: [
      'Salary',
      'Freelance',
      'Investments',
      'Business',
      'Other Income'
    ],
    expense: [
      'Food & Dining',
      'Shopping',
      'Transport',
      'Bills & Utilities',
      'Entertainment',
      'Healthcare',
      'Travel',
      'Other'
    ]
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const numericAmount = parseFloat(amount);
      
      if (isNaN(numericAmount)) {
        toast.error('Please enter a valid amount');
        return;
      }

      const transactionRef = collection(db, 'users', currentUser.uid, 'transactions');
      await addDoc(transactionRef, {
        amount: numericAmount,
        type,
        category,
        description,
        date,
        currency, // Store the currency used when creating the transaction
        createdAt: serverTimestamp()
      });

      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      onClose();
      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error(`Failed to add ${type}.`);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Preview the amount in the current currency
  const previewAmount = amount ? formatAmount(parseFloat(amount)) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setType('income')}
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
              onClick={() => setType('expense')}
            >
              Expense
            </button>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount ({currency})
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${currency}`}
            />
            {amount && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Preview: {previewAmount}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              required
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories[type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              required
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`btn w-full flex items-center justify-center ${
              type === 'income'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              `Add ${type === 'income' ? 'Income' : 'Expense'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}