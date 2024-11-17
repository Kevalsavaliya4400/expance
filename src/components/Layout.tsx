import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddExpenseModal from './AddExpenseModal';

export default function Layout() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onAddExpense={() => setIsAddExpenseOpen(true)} 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-800 overflow-auto">
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