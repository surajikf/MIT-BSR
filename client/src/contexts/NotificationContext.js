import React, { createContext, useContext, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: 'info',
      title: 'Notification',
      message: 'This is a notification',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((title, message, duration = 5000) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showError = useCallback((title, message, duration = 7000) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showWarning = useCallback((title, message, duration = 6000) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showInfo = useCallback((title, message, duration = 5000) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }, [addNotification]);

  // Trading-specific notifications
  const showStopLossAlert = useCallback((signal) => {
    return addNotification({
      type: 'error',
      title: '🚨 Stop Loss Alert',
      message: `${signal.pair} hit stop loss at $${signal.stopLoss}`,
      duration: 10000
    });
  }, [addNotification]);

  const showTakeProfitAlert = useCallback((signal) => {
    return addNotification({
      type: 'success',
      title: '🎯 Take Profit Hit',
      message: `${signal.pair} reached take profit target`,
      duration: 10000
    });
  }, [addNotification]);

  const showNewSignal = useCallback((signal) => {
    return addNotification({
      type: 'info',
      title: '🆕 New Signal',
      message: `${signal.recommendation} signal for ${signal.pair}`,
      duration: 8000
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showStopLossAlert,
    showTakeProfitAlert,
    showNewSignal
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
    }
  };

  return (
    <div
      className={`notification max-w-sm w-full p-4 rounded-lg border shadow-large ${getTypeStyles()}`}
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(notification.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
