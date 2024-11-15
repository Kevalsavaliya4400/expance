import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
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
import toast from 'react-hot-toast';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { currentUser } = useAuth();
  const { formatAmount } = useCurrency();

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
        setError(null);
      },
      (err) => {
        setError('Failed to load transactions');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const stats = [
    {
      title: 'Total Balance',
      value: formatAmount(balance),
      icon: DollarSign,
      trend: balance >= 0 ? 'up' : 'down',
      color: balance >= 0 ? 'green' : 'red',
    },
    {
      title: 'Total Income',
      value: formatAmount(totalIncome),
      icon: TrendingUp,
      trend: 'up',
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: formatAmount(totalExpenses),
      icon: TrendingDown,
      trend: 'down',
      color: 'red',
    },
  ];

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

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;

    try {
      const transactionRef = doc(
        db,
        'users',
        currentUser.uid,
        'transactions',
        editingTransaction.id
      );
      await updateDoc(transactionRef, {
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
      });
      setIsEditModalOpen(false);
      toast.success('Transaction updated successfully');
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast.error('Failed to update transaction');
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
      toast.success('Transaction deleted successfully');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Failed to delete transaction');
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</h3>
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

      {/* Charts and Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-auto">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => openEditModal(transaction)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {transaction.category} •{' '}
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`font-semibold whitespace-nowrap ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTransaction(transaction.id);
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Income by Category</h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                  <XAxis
                    dataKey="name"
                    className="text-gray-600 dark:text-gray-400"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    width={60}
                    tickFormatter={(value) => formatAmount(value).replace(/[^0-9.]/g, '')}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatAmount(value), 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Expenses by Category</h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                  <XAxis
                    dataKey="name"
                    className="text-gray-600 dark:text-gray-400"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    width={60}
                    tickFormatter={(value) => formatAmount(value).replace(/[^0-9.]/g, '')}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatAmount(value), 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">Edit Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={editingTransaction.category}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev!,
                      category: e.target.value,
                    }))
                  }
                  className="input w-full"
                />
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={closeEditModal}
                  className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditTransaction}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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