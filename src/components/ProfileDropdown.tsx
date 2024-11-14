import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
      >
        {currentUser?.email?.[0].toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 animate-slide-down">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium truncate">{currentUser?.email}</p>
          </div>
          
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}