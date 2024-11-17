import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from '../constants/transactions';
import { format } from 'date-fns';
import { Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: keyof typeof TRANSACTION_TYPES;
  category: string;
  amount: number;
  description: string;
  date: Date;
  currency: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<keyof typeof TRANSACTION_TYPES | 'all'>('all');
  const { currentUser } = useAuth();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    if (!currentUser) return;

    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    let q = query(transactionsRef, orderBy('date', 'desc'));

    if (filter !== 'all') {
      q = query(q, where('type', '==', filter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Handle both Timestamp and regular date strings
        const date = data.date instanceof Timestamp 
          ? data.date.toDate() 
          : new Date(data.date);
        
        return {
          id: doc.id,
          ...data,
          date,
        };
      }) as Transaction[];

      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, filter]);

  const getCategoryDetails = (type: keyof typeof TRANSACTION_TYPES, categoryId: string) => {
    return TRANSACTION_CATEGORIES[type].find((cat) => cat.id === categoryId) || {
      name: 'Unknown',
      icon: '❓',
    };
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
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="input"
          >
            <option value="all">All Transactions</option>
            <option value={TRANSACTION_TYPES.INCOME}>Income Only</option>
            <option value={TRANSACTION_TYPES.EXPENSE}>Expenses Only</option>
          </select>
          <button className="btn btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const category = getCategoryDetails(transaction.type, transaction.category);
            return (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.name} • {format(transaction.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center ${
                      transaction.type === TRANSACTION_TYPES.INCOME
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === TRANSACTION_TYPES.INCOME ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}