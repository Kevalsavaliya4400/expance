import { Bell, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  onAddExpense: () => void;
}

export default function Navbar({ onAddExpense }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Expense Tracker</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onAddExpense}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <ProfileDropdown />
      </div>
    </nav>
  );
}