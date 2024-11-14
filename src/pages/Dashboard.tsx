import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchExpenses() {
      if (!currentUser) return;

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const expenseData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      setExpenses(expenseData);
      setLoading(false);
    }

    fetchExpenses();
  }, [currentUser]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpense = expenses.length ? totalExpenses / expenses.length : 0;

  const chartData = [
    { name: 'Food', amount: 450 },
    { name: 'Transport', amount: 300 },
    { name: 'Shopping', amount: 600 },
    { name: 'Bills', amount: 850 },
    { name: 'Entertainment', amount: 400 }
  ];

  const stats = [
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      icon: DollarSign,
      trend: 'up',
      change: '+12.5%'
    },
    {
      title: 'Average Expense',
      value: `$${avgExpense.toFixed(2)}`,
      icon: Activity,
      trend: 'down',
      change: '-3.2%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${
                stat.trend === 'up' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`ml-1 text-sm ${
                stat.trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change} from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}