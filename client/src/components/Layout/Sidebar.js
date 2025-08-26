import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Bitcoin, 
  DollarSign, 
  History, 
  Settings,
  TrendingUp,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      description: 'Market overview and signals summary'
    },
    {
      name: 'Crypto Signals',
      href: '/crypto',
      icon: Bitcoin,
      description: 'Bitcoin and cryptocurrency trading signals'
    },
    {
      name: 'Forex Signals',
      href: '/forex',
      icon: DollarSign,
      description: 'Forex currency pair trading signals'
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      description: 'Past signals and performance tracking'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'User preferences and configuration'
    }
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
              <TrendingUp className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">Trading Pro</span>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${isActive(item.href)
                          ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }
                      `}
                      title={item.description}
                    >
                      <Icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                          ${isActive(item.href)
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                          }
                        `}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            
            {/* Theme toggle */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">Trading Pro</span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                        ${isActive(item.href)
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                        }
                      `}
                    />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          {/* Theme toggle */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
