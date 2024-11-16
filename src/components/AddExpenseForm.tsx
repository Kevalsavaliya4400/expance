import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { X, CreditCard, Building2, Receipt, CalendarDays, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Payment method icons/logos
const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'gpay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Google_Pay_Logo.svg' },
  { id: 'paypal', name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { id: 'apple_pay', name: 'Apple Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg' },
  { id: 'stripe', name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
];

const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'utilities', name: 'Bills & Utilities', icon: '📱' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'other', name: 'Other', icon: '📌' },
];

const AddExpenseForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { currency, formatAmount } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
        category,
        amount: numericAmount,
        currency,
        date: new Date(date),
        paymentMethod,
        company,
        description,
        createdAt: new Date(),
      });
      toast.success('Expense added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const previewAmount = amount ? formatAmount(parseFloat(amount)) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-xl w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Expense</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currency}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
                min="0"
                className="input w-full pl-12"
                placeholder="0.00"
              />
            </div>
            {amount && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preview: {previewAmount}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    category === cat.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-xs text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {method.logo ? (
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-8 h-8 object-contain mb-1"
                    />
                  ) : (
                    <span className="text-2xl mb-1">{method.icon}</span>
                  )}
                  <span className="text-xs text-center">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Company/Merchant Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Company/Merchant
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input w-full pl-10"
                placeholder="Enter company or merchant name"
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full pl-10 min-h-[80px]"
                placeholder="Add notes or description"
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input w-full pl-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseForm;