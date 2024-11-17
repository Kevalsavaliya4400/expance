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
    <nav className="sticky top-0 z-30 h-16 glass-card flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg sm:text-xl font-display font-bold gradient-text">
          Expense Tracker
        </h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onAddExpense}
          className="btn btn-primary flex items-center gap-2"
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