import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddExpenseModal from './AddExpenseModal';

export default function Layout() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar onAddExpense={() => setIsAddExpenseOpen(true)} />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        <AddExpenseModal 
          isOpen={isAddExpenseOpen} 
          onClose={() => setIsAddExpenseOpen(false)} 
        />
      </div>
    </div>
  );
}