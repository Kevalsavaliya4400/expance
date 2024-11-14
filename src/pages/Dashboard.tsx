import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: '',
    amount: 0,
    type: 'income',
    category: '',
    date: '',
    description: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        setTransactions(transactionData);
        setLoading(false);
        setError(null); // Reset error on success
      },
      (err) => {
        setError('Failed to load transactions');
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [currentUser]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const incomeData = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ name: t.category, amount: t.amount });
      }
      return acc;
    }, [] as { name: string; amount: number }[]);

  const expenseData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ name: t.category, amount: t.amount });
      }
      return acc;
    }, [] as { name: string; amount: number }[]);

  const stats = [
    {
      title: 'Total Balance',
      value: `$${balance.toFixed(2)}`,
      icon: DollarSign,
      trend: balance >= 0 ? 'up' : 'down',
      color: balance >= 0 ? 'green' : 'red',
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      trend: 'up',
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      trend: 'down',
      color: 'red',
    },
  ];

  const handleAddTransaction = async () => {
    try {
      const transaction = { ...newTransaction, date: new Date().toISOString() };
      await addDoc(
        collection(db, 'users', currentUser.uid, 'transactions'),
        transaction
      );
      setNewTransaction({
        id: '',
        amount: 0,
        type: 'income',
        category: '',
        date: '',
        description: '',
      });
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const handleEditTransaction = async () => {
    if (editingTransaction) {
      try {
        const transactionRef = doc(
          db,
          'users',
          currentUser.uid,
          'transactions',
          editingTransaction.id
        );
        await updateDoc(transactionRef, editingTransaction);
        setIsEditModalOpen(false); // Close modal after saving
      } catch (err) {
        console.error('Error updating transaction:', err);
      }
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const transactionRef = doc(
        db,
        'users',
        currentUser.uid,
        'transactions',
        transactionId
      );
      await deleteDoc(transactionRef);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div
                className={`p-3 rounded-full ${
                  stat.color === 'green'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4 max-h-96 overflow-auto">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                onClick={() => openEditModal(transaction)} // Open modal on click
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.category} •{' '}
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Income by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:opacity-20"
                />
                <XAxis
                  dataKey="name"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:opacity-20"
                />
                <XAxis
                  dataKey="name"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-2xl font-semibold mb-4">Edit Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm">Description</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm">Amount</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm">Category</label>
                <input
                  type="text"
                  value={editingTransaction.category}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      category: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={closeEditModal}
                  className="py-2 px-4 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditTransaction}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
