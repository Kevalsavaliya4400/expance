import { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Plus } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function Calendar() {
  const [selected, setSelected] = useState<Date>();

  // Example expense data
  const expenses = [
    { date: new Date(2024, 2, 15), amount: 50.00, category: 'Food' },
    { date: new Date(2024, 2, 18), amount: 120.00, category: 'Shopping' },
    { date: new Date(2024, 2, 20), amount: 35.00, category: 'Transport' }
  ];

  const footer = selected ? (
    <div className="mt-4">
      <h3 className="font-medium">Expenses for {format(selected, 'PP')}</h3>
      <ul className="mt-2 space-y-1">
        {expenses
          .filter(expense => format(expense.date, 'P') === format(selected, 'P'))
          .map((expense, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span>{expense.category}</span>
              <span className="font-medium">${expense.amount.toFixed(2)}</span>
            </li>
          ))}
      </ul>
    </div>
  ) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="card md:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Expense Calendar</h2>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            footer={footer}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800"
            classNames={{
              day_selected: "bg-primary-600 text-white",
              day_today: "font-bold text-primary-600 dark:text-primary-400"
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upcoming Bills</h3>
          <div className="space-y-4">
            {[
              { title: 'Rent', amount: 1200, dueDate: '2024-03-01' },
              { title: 'Utilities', amount: 150, dueDate: '2024-03-15' },
              { title: 'Internet', amount: 80, dueDate: '2024-03-20' }
            ].map((bill) => (
              <div key={bill.title} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bill.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due {format(new Date(bill.dueDate), 'MMM d')}
                  </p>
                </div>
                <span className="font-semibold">${bill.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget</span>
              <span>$3,000.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Spent</span>
              <span>$1,850.00</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
              <span>Remaining</span>
              <span>$1,150.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}