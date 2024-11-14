import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Plus } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { db } from '../lib/firebase'; // Ensure this is imported correctly
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import AddExpenseForm from './AddExpenseForm'; // Correct path to AddExpenseForm component

export default function Calendar() {
  const [selected, setSelected] = useState<Date | undefined>(new Date()); // Set today's date as default
  const [transactions, setTransactions] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Fetch Transactions from Firebase
    const transactionsQuery = query(
      collection(db, 'users', currentUser.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (querySnapshot) => {
        const transactionsData = querySnapshot.docs.map((doc) => doc.data());
        setTransactions(transactionsData);
      }
    );

    // Fetch Upcoming Bills from Firebase
    const billsQuery = query(
      collection(db, 'users', currentUser.uid, 'bills'),
      orderBy('dueDate', 'asc')
    );

    const unsubscribeBills = onSnapshot(billsQuery, (querySnapshot) => {
      const billsData = querySnapshot.docs.map((doc) => doc.data());
      setUpcomingBills(billsData);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeBills();
    };
  }, [currentUser]);

  const footer = selected ? (
    <div className="mt-4 text-sm">
      <h3 className="font-medium text-lg">
        Transactions for {format(selected, 'PP')}
      </h3>
      <ul className="mt-2 space-y-1">
        {transactions
          .filter(
            (transaction) =>
              format(new Date(transaction.date), 'P') === format(selected, 'P')
          )
          .map((transaction, index) => (
            <li
              key={index}
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
              format(new Date(bill.dueDate), 'P') === format(selected, 'P')
          )
          .map((bill, index) => (
            <li
              key={index}
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
      No transactions or bills for today.
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="card md:col-span-2 p-6 bg-opacity-40 backdrop-blur-xl rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Expense Calendar
          </h2>
          <button className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition">
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
              day_selected:
                'bg-blue-600 text-white border-2 border-white rounded-lg', // Selected day style (blue with white text and white border)
              day_today:
                'font-bold text-white bg-blue-600 border-2 border-blue-500 rounded-lg', // Today's date style (bold, white text, blue background)
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6 bg-opacity-40 backdrop-blur-xl rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Upcoming Bills
          </h3>
          <div className="space-y-4">
            {upcomingBills.map((bill) => (
              <div
                key={bill.title}
                className="flex items-center justify-between bg-white dark:bg-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {bill.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due {format(new Date(bill.dueDate), 'MMM d')}
                  </p>
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  ${bill.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
