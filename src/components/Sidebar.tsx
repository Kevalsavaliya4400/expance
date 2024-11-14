import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
        <PiggyBank className="w-8 h-8 text-primary-500" />
        <span className="font-bold text-xl">ExpenseTracker</span>
      </div>
      <nav className="p-4 flex flex-col gap-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}