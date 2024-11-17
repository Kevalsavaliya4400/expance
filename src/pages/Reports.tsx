import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { REPORT_TYPES, TIME_PERIODS, CHART_TYPES } from '../constants/reports';
import { TRANSACTION_CATEGORIES } from '../constants/transactions';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { subDays, format } from 'date-fns';

const COLORS = [
  '#4caf50',
  '#2196f3',
  '#ff9800',
  '#e91e63',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#795548',
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES.EXPENSE_BY_CATEGORY);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS.MONTH);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const { formatAmount, currency } = useCurrency();

  useEffect(() => {
    if (!currentUser) return;
    fetchReportData();
  }, [currentUser, selectedReport, selectedPeriod]);

  const fetchReportData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
      const startDate = getStartDate(selectedPeriod);
      
      const q = query(
        transactionsRef,
        where('date', '>=', startDate)
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        };
      });

      const processedData = processTransactions(transactions);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case TIME_PERIODS.WEEK:
        return subDays(now, 7);
      case TIME_PERIODS.MONTH:
        return subDays(now, 30);
      case TIME_PERIODS.QUARTER:
        return subDays(now, 90);
      case TIME_PERIODS.YEAR:
        return subDays(now, 365);
      default:
        return new Date(0);
    }
  };

  const processTransactions = (transactions: any[]) => {
    switch (selectedReport) {
      case REPORT_TYPES.EXPENSE_BY_CATEGORY:
        return processExpensesByCategory(transactions);
      case REPORT_TYPES.INCOME_BY_CATEGORY:
        return processIncomeByCategory(transactions);
      case REPORT_TYPES.CASH_FLOW:
        return processCashFlow(transactions);
      default:
        return [];
    }
  };

  const processExpensesByCategory = (transactions: any[]) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    return aggregateByCategory(expenses);
  };

  const processIncomeByCategory = (transactions: any[]) => {
    const income = transactions.filter(t => t.type === 'income');
    return aggregateByCategory(income);
  };

  const aggregateByCategory = (transactions: any[]) => {
    const categoryTotals = transactions.reduce((acc: any, t: any) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: TRANSACTION_CATEGORIES[transactions[0]?.type]
        .find(cat => cat.id === category)?.name || category,
      value: amount,
    }));
  };

  const processCashFlow = (transactions: any[]) => {
    const dailyTotals = transactions.reduce((acc: any, t: any) => {
      const date = format(t.date, 'MMM d');
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += t.amount;
      } else {
        acc[date].expenses += t.amount;
      }
      return acc;
    }, {});

    return Object.values(dailyTotals);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financial Reports</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="input"
          >
            <option value={REPORT_TYPES.EXPENSE_BY_CATEGORY}>Expenses by Category</option>
            <option value={REPORT_TYPES.INCOME_BY_CATEGORY}>Income by Category</option>
            <option value={REPORT_TYPES.CASH_FLOW}>Cash Flow</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            <option value={TIME_PERIODS.WEEK}>Last 7 days</option>
            <option value={TIME_PERIODS.MONTH}>Last 30 days</option>
            <option value={TIME_PERIODS.QUARTER}>Last 90 days</option>
            <option value={TIME_PERIODS.YEAR}>Last year</option>
            <option value={TIME_PERIODS.ALL}>All time</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="h-[400px]">
          {selectedReport === REPORT_TYPES.CASH_FLOW ? (
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatAmount(value), '']}
                />
                <Bar dataKey="income" fill="#4caf50" name="Income" />
                <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ name, value }) => `${name} (${formatAmount(value)})`}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatAmount(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}