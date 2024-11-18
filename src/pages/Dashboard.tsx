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
import InsightsPanel from '../components/AIInsights/InsightsPanel';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  currency: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const { currentUser } = useAuth();
  const { formatAmount, currency, convertAmount } = useCurrency();

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

  // Calculate totals by converting each transaction to the current currency
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce(
      (sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency),
      0
    );

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce(
      (sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency),
      0
    );

  const balance = totalIncome - totalExpenses;

  // Group transactions by category for charts
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const convertedAmount = convertAmount(
      transaction.amount,
      transaction.currency || 'USD',
      currency
    );

    const key = `${transaction.type}-${transaction.category}`;
    acc[key] = (acc[key] || 0) + convertedAmount;
    return acc;
  }, {} as Record<string, number>);

  const incomeData = Object.entries(categoryTotals)
    .filter(([key]) => key.startsWith('income-'))
    .map(([key, value]) => ({
      name: key.replace('income-', ''),
      amount: value,
    }));

  const expenseData = Object.entries(categoryTotals)
    .filter(([key]) => key.startsWith('expense-'))
    .map(([key, value]) => ({
      name: key.replace('expense-', ''),
      amount: value,
    }));

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
                <h3 className="text-xl sm:text-2xl font-bold mt-1">
                  {stat.value}
                </h3>
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

      {/* AI Insights Panel */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">AI Insights</h2>
        <InsightsPanel transactions={transactions} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Income by Category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:opacity-20"
                />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatAmount(value), 'Amount']}
                />
                <Bar dataKey="amount" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Expenses by Category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:opacity-20"
                />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatAmount(value), 'Amount']}
                />
                <Bar dataKey="amount" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => {
                setEditingTransaction(transaction);
                setIsEditModalOpen(true);
              }}
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.category} •{' '}
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`font-semibold ${
                  transaction.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount, transaction.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
