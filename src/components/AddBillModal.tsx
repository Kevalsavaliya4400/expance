import { useState, useEffect } from 'react';
import { X, Calendar, Building2, Receipt } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { BILL_STATUS, BILL_CATEGORIES, BILL_FREQUENCIES } from '../constants/bills';
import toast from 'react-hot-toast';

interface Bill {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: Date;
  status: keyof typeof BILL_STATUS;
  currency: string;
  frequency?: string;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBill?: Bill | null;
  onEditComplete?: () => void;
}

export default function AddBillModal({ isOpen, onClose, editBill, onEditComplete }: AddBillModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { currency, formatAmount } = useCurrency();

  useEffect(() => {
    if (editBill) {
      setTitle(editBill.title);
      setAmount(editBill.amount.toString());
      setCategory(editBill.category);
      setDueDate(editBill.dueDate.toISOString().split('T')[0]);
      setFrequency(editBill.frequency || 'monthly');
    }
  }, [editBill]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setDueDate('');
    setFrequency('monthly');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const billData = {
        title,
        amount: numericAmount,
        category,
        dueDate: new Date(dueDate),
        frequency,
        status: BILL_STATUS.PENDING,
        currency,
        lastUpdated: new Date(),
        userId: currentUser.uid
      };

      if (editBill) {
        const billRef = doc(db, 'users', currentUser.uid, 'bills', editBill.id);
        await updateDoc(billRef, billData);
        toast.success('Bill updated successfully!');
        onEditComplete?.();
      } else {
        const billsRef = collection(db, 'users', currentUser.uid, 'bills');
        await addDoc(billsRef, {
          ...billData,
          createdAt: new Date(),
        });
        toast.success('Bill added successfully!');
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error(editBill ? 'Failed to update bill' : 'Failed to add bill');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{editBill ? 'Edit Bill' : 'Add New Bill'}</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
              if (editBill) onEditComplete?.();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bill Title</label>
            <div className="relative">
              <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                className="input pl-10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter bill title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="input pl-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {amount && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Preview: {formatAmount(parseFloat(amount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              required
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {BILL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                required
                className="input pl-10"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frequency</label>
            <select
              required
              className="input"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              {BILL_FREQUENCIES.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              editBill ? 'Update Bill' : 'Add Bill'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}