import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  TrendingUp,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/transactions', icon: CreditCard, label: 'Transactions' },
    { to: '/reports', icon: TrendingUp, label: 'Reports' },
    { to: '/bills', icon: FileText, label: 'Bills' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={`h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } transition-all duration-300 ease-in-out`}
    >
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <PiggyBank className={`w-8 h-8 text-primary-500 ${!isSidebarOpen && 'mx-auto'}`} />
          {isSidebarOpen && (
            <span className="font-bold text-xl">ExpenseTracker</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile close button */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          {/* Desktop collapse button */}
          {!isMobile && (
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 flex flex-col gap-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon className={`w-5 h-5 ${!isSidebarOpen && 'mx-auto'}`} />
              {isSidebarOpen && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className={`w-full rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 ${
            isSidebarOpen ? 'px-4 py-2 text-sm text-red-600 dark:text-red-400' : 'p-3'
          }`}
        >
          <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'inline mr-2' : 'mx-auto'} text-red-600 dark:text-red-400`} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}