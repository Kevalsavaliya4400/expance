import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Plus } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import AddExpenseForm from './AddExpenseForm';

export default function Calendar() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create user document if it doesn't exist
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, {
        email: currentUser.email,
        lastUpdated: new Date()
      }, { merge: true });

      // Fetch Transactions
      const transactionsQuery = query(
        collection(db, 'users', currentUser.uid, 'transactions'),
        orderBy('date', 'desc')
      );

      const unsubscribeTransactions = onSnapshot(
        transactionsQuery,
        (querySnapshot) => {
          const transactionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(doc.data().date)
          }));
          setTransactions(transactionsData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching transactions:', error);
          setError('Failed to load transactions');
          setIsLoading(false);
        }
      );

      // Fetch Bills
      const billsQuery = query(
        collection(db, 'users', currentUser.uid, 'bills'),
        orderBy('dueDate', 'asc')
      );

      const unsubscribeBills = onSnapshot(
        billsQuery,
        (querySnapshot) => {
          const billsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate)
          }));
          setUpcomingBills(billsData);
        },
        (error) => {
          console.error('Error fetching bills:', error);
        }
      );

      return () => {
        unsubscribeTransactions();
        unsubscribeBills();
      };
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setError('Failed to initialize data');
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const footer = selected ? (
    <div className="mt-4 text-sm">
      <h3 className="font-medium text-lg">
        Transactions for {format(selected, 'PP')}
      </h3>
      <ul className="mt-2 space-y-1">
        {transactions
          .filter(
            (transaction) =>
              format(transaction.date, 'P') === format(selected, 'P')
          )
          .map((transaction) => (
            <li
              key={transaction.id}
              className={`flex items-center justify-between ${
                transaction.type === 'income'
                  ? 'text-green-500'
                  : 'text-red-500'
              } py-2 px-3 rounded-lg`}
            >
              <span>{transaction.category}</span>
              <span className="font-medium">
                ${transaction.amount.toFixed(2)}
              </span>
            </li>
          ))}
        {upcomingBills
          .filter(
            (bill) =>
              format(bill.dueDate, 'P') === format(selected, 'P')
          )
          .map((bill) => (
            <li
              key={bill.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
            >
              <span>{bill.title}</span>
              <span className="font-medium">${bill.amount.toFixed(2)}</span>
            </li>
          ))}
      </ul>
    </div>
  ) : (
    <div className="text-center text-sm text-gray-500">
      Select a date to view transactions
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="card md:col-span-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Expense Calendar</h2>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            footer={footer}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-xl"
            classNames={{
              day_selected: 'bg-primary-600 text-white hover:bg-primary-700',
              day_today: 'font-bold text-primary-600 dark:text-primary-400',
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Bills</h3>
          <div className="space-y-4">
            {upcomingBills.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming bills
              </p>
            ) : (
              upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  <div>
                    <p className="font-medium">{bill.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Due {format(bill.dueDate, 'MMM d')}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ${bill.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}