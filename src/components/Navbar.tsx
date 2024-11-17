import { Plus, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onAddExpense: () => void;
  onMenuClick: () => void;
}

export default function Navbar({ onAddExpense, onMenuClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
          Expense Tracker
        </h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onAddExpense}
          className="btn btn-primary flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-3 sm:px-4 py-2 transition duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}