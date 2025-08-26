import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-authenticate user for demo purposes
    const mockUser = {
      id: '1',
      username: 'Trader',
      email: 'trader@example.com',
      preferences: {
        stopLossPercent: 1.5,
        takeProfit1Percent: 2.0,
        takeProfit2Percent: 5.0,
        notificationSound: true,
        theme: 'light'
      }
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    
    // Store demo token for consistency
    localStorage.setItem('authToken', 'demo-token-123');
  }, []);

  const login = async (credentials) => {
    try {
      // In a real app, make API call to backend
      // For demo purposes, simulate successful login
      const mockUser = {
        id: '1',
        username: credentials.username || 'Trader',
        email: credentials.email || 'trader@example.com',
        preferences: {
          stopLossPercent: 1.5,
          takeProfit1Percent: 2.0,
          takeProfit2Percent: 5.0,
          notificationSound: true,
          theme: 'light'
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store token (in real app, this comes from backend)
      localStorage.setItem('authToken', 'demo-token-123');
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updatePreferences = (newPreferences) => {
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...newPreferences
        }
      });
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
