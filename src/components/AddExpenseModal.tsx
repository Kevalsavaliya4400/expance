import { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transport',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Other'
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'expenses'), {
        userId: currentUser.uid,
        amount: parseFloat(amount),
        category,
        description,
        date,
        createdAt: new Date()
      });
      toast.success('Expense added successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to add expense.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
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
              {categories.map((cat) => (
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
            className="btn btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Add Expense'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}