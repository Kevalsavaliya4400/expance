import { useState, useEffect } from 'react';
import { Bell, DollarSign, Mail, Shield } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import toast from 'react-hot-toast';

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
];

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true
  });
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setIsChangingCurrency(true);
      await setCurrency(e.target.value);
      toast.success('Currency updated successfully');
    } catch (error) {
      toast.error('Failed to update currency');
    } finally {
      setIsChangingCurrency(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Currency Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-2">
              Default Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                value={currency}
                onChange={handleCurrencyChange}
                disabled={isChangingCurrency}
                className="input pr-10 appearance-none"
              >
                {currencies.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
              {isChangingCurrency && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will update the currency display across all your transactions
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          {[
            { id: 'email', label: 'Email Notifications', icon: Mail },
            { id: 'push', label: 'Push Notifications', icon: Bell },
            { id: 'weekly', label: 'Weekly Summary', icon: Bell },
            { id: 'monthly', label: 'Monthly Report', icon: Bell }
          ].map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[id as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications(prev => ({
                      ...prev,
                      [id]: e.target.checked
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        <div className="space-y-4">
          <button className="btn btn-primary w-full">Change Password</button>
          <button className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 w-full">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  );
}