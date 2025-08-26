import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showError('Validation Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Login Successful', 'Welcome to Trading Signals Pro!');
        navigate('/');
      } else {
        showError('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      showError('Login Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for quick access
  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      const result = await login({
        username: 'demo',
        password: 'demo123'
      });
      
      if (result.success) {
        showSuccess('Demo Login', 'Welcome to the demo!');
        navigate('/');
      }
    } catch (error) {
      showError('Demo Login Failed', 'Could not access demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Trading Signals Pro
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your trading dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Quick Access
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full btn-outline py-3 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  'Try Demo Account'
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Demo credentials: demo / demo123
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Real-time Signals</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Live buy/sell recommendations
            </p>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Crypto & Forex</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              BTC/USDT and major pairs
            </p>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Smart Alerts</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stop-loss & take-profit alerts
            </p>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Technical Analysis</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              RSI, MACD, EMA indicators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
