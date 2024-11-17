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
      className={`h-full flex flex-col glass-card ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } transition-all duration-300 ease-in-out`}
    >
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl gradient-text">Expance</span>
          )}
        </div>
        
        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <nav className="space-y-2">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              <Icon className={`w-5 h-5 ${!isSidebarOpen && 'mx-auto'}`} />
              {isSidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3">
        <button
          onClick={logout}
          className="nav-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
        >
          <LogOut className="w-5 h-5" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}