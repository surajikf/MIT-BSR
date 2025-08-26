import React from 'react';
import { TrendingUp } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Logo with animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center shadow-large animate-pulse">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 w-20 h-20 bg-primary-400 rounded-2xl animate-ping opacity-20"></div>
          </div>
        </div>
        
        {/* App title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trading Signals Pro
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Loading your trading dashboard...
        </p>
        
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="spinner h-8 w-8"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">Initializing components...</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        {/* Features preview */}
        <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-soft">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Real-time Signals</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-soft">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Crypto & Forex</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-soft">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Smart Alerts</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-soft">
            <div className="text-2xl mb-1">📈</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Technical Analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
