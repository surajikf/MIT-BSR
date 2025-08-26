import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ChartContainer = () => {
  const containerRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    // Initialize TradingView widget
    if (window.TradingView && containerRef.current) {
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol: 'BINANCE:BTCUSDT',
        interval: '1D',
        timezone: 'Etc/UTC',
        theme: isDark ? 'dark' : 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_chart',
        width: '100%',
        height: '400',
        studies: [
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies',
          'EMA@tv-basicstudies'
        ],
        disabled_features: [
          'use_localstorage_for_settings',
          'volume_force_overlay'
        ],
        enabled_features: [
          'study_templates',
          'side_toolbar_in_fullscreen_mode'
        ],
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
          'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350'
        },
        loading_screen: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          foregroundColor: isDark ? '#ffffff' : '#000000'
        }
      });
    }
  }, [isDark]);

  return (
    <div className="w-full">
      <div 
        id="tradingview_chart" 
        ref={containerRef}
        className="w-full h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      />
      
      {/* Fallback content if TradingView fails to load */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">📊 Chart Features:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Real-time BTC/USDT price chart</li>
            <li>Technical indicators: RSI, MACD, EMA</li>
            <li>Multiple timeframes available</li>
            <li>Interactive drawing tools</li>
            <li>Dark/Light theme support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
