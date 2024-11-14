import { Bell, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  onAddExpense: () => void;
}

export default function Navbar({ onAddExpense }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white dark:bg-gray-800 bg-opacity-40 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between shadow-md transition-all duration-300">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        Expense Tracker
      </h1>
      <div className="flex items-center gap-4">
        {/* Add Expense Button */}
        <button
          onClick={onAddExpense}
          className="btn btn-primary flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>

        {/* Notifications Button */}
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition duration-200">
          <Bell className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition duration-200"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </nav>
  );
}
