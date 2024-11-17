import { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import toast from 'react-hot-toast';
import TransactionTypeSelector from './TransactionTypeSelector';
import AmountInput from './AmountInput';
import CategorySelect from './CategorySelect';

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

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const numericAmount = parseFloat(amount);
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast.error('Please enter a valid amount greater than 0');
        return;
      }

      const transactionData = {
        amount: numericAmount,
        type,
        category,
        description,
        date: new Date(date),
        currency,
        createdAt: new Date(),
        userId: currentUser.uid
      };

      const transactionRef = collection(db, 'users', currentUser.uid, 'transactions');
      await addDoc(transactionRef, transactionData);

      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(`Failed to add ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const previewAmount = amount ? formatAmount(parseFloat(amount)) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TransactionTypeSelector type={type} onChange={setType} />
          
          <AmountInput
            amount={amount}
            currency={currency}
            onChange={setAmount}
          />
          {amount && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Preview: {previewAmount}
            </p>
          )}

          <CategorySelect
            type={type}
            value={category}
            onChange={setCategory}
          />

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
              placeholder="Enter description"
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