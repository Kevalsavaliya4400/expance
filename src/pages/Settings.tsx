import { useState, useEffect } from 'react';
import {
  Bell,
  DollarSign,
  Mail,
  Shield,
  Building,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
];

const defaultPaymentMethods = [
  {
    id: 'gpay',
    name: 'Google Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
  },
];

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true,
  });
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(defaultPaymentMethods);
  const [banks, setBanks] = useState<any[]>([]);

  // Load user settings
  useEffect(() => {
    if (currentUser) {
      loadUserSettings();
    }
  }, [currentUser]);

  const loadUserSettings = async () => {
    if (!currentUser) return;

    try {
      const settingsDoc = await getDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'payment')
      );
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
        if (data.banks) setBanks(data.banks);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleCurrencyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

  const handleAddPaymentMethod = async (formData: FormData) => {
    if (!currentUser) return;

    const newMethod = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
    };

    try {
      const updatedMethods = [...paymentMethods, newMethod];
      await setDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'payment'),
        {
          paymentMethods: updatedMethods,
        },
        { merge: true }
      );

      setPaymentMethods(updatedMethods);
      setShowAddPayment(false);
      toast.success('Payment method added successfully');
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const handleAddBank = async (formData: FormData) => {
    if (!currentUser) return;

    const newBank = {
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      routingNumber: formData.get('routingNumber') as string,
    };

    try {
      const updatedBanks = [...banks, newBank];
      await setDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'payment'),
        {
          banks: updatedBanks,
        },
        { merge: true }
      );

      setBanks(updatedBanks);
      setShowAddBank(false);
      toast.success('Bank account added successfully');
    } catch (error) {
      toast.error('Failed to add bank account');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Currency Settings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Currency Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium mb-2"
            >
              Default Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                value={currency}
                onChange={handleCurrencyChange}
                disabled={isChangingCurrency}
                className="input pr-10"
              >
                {currencies.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Payment Methods</h2>
          </div>
          <button
            onClick={() => setShowAddPayment(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Method
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {method.logo && (
                <img
                  src={method.logo}
                  alt={method.name}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <p className="font-medium">{method.name}</p>
                {method.accountNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    •••• {method.accountNumber.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddPaymentMethod(new FormData(e.currentTarget));
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Method Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Account Number
                    </label>
                    <input
                      name="accountNumber"
                      type="text"
                      required
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddPayment(false)}
                      className="flex-1 btn bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn btn-primary">
                      Add Method
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bank Accounts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Bank Accounts</h2>
          </div>
          <button
            onClick={() => setShowAddBank(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Bank
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banks.map((bank, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <p className="font-medium">{bank.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account: •••• {bank.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Routing: •••• {bank.routingNumber.slice(-4)}
              </p>
            </div>
          ))}
        </div>

        {showAddBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Add Bank Account</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBank(new FormData(e.currentTarget));
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bank Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Account Number
                    </label>
                    <input
                      name="accountNumber"
                      type="text"
                      required
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Routing Number
                    </label>
                    <input
                      name="routingNumber"
                      type="text"
                      required
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="flex-1 btn bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn btn-primary">
                      Add Bank
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Other Settings sections remain unchanged */}
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
            { id: 'monthly', label: 'Monthly Report', icon: Bell },
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
                    setNotifications((prev) => ({
                      ...prev,
                      [id]: e.target.checked,
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
