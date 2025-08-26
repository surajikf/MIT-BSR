import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CryptoSignals from './pages/CryptoSignals';
import ForexSignals from './pages/ForexSignals';
import History from './pages/History';
import Settings from './pages/Settings';

import LoadingScreen from './components/UI/LoadingScreen';

// Protected Route Component - Now always allows access
const ProtectedRoute = ({ children }) => {
  return children; // Bypass authentication - always show dashboard
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="crypto" element={<CryptoSignals />} />
                    <Route path="forex" element={<ForexSignals />} />
                    <Route path="history" element={<History />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
