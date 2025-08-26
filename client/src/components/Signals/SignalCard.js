import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SignalCard = ({ signal, onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { isDark } = useTheme();

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return <TrendingUp className="h-5 w-5 text-success-600" />;
      case 'SELL':
        return <TrendingDown className="h-5 w-5 text-danger-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'SELL':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'hit_sl':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'hit_tp1':
      case 'hit_tp2':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'market_invalid':
        return <TrendingDownIcon className="h-4 w-4 text-orange-500" />;
      case 'technical_invalid':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'hit_sl':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'hit_tp1':
      case 'hit_tp2':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'market_invalid':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'technical_invalid':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Still Running';
      case 'hit_sl':
        return 'Stop Loss Hit';
      case 'hit_tp1':
        return 'TP1 Hit';
      case 'hit_tp2':
        return 'TP2 Hit';
      case 'market_invalid':
        return 'Market Trend Changed';
      case 'technical_invalid':
        return 'Technical Invalid';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'active':
        return 'Signal is active and running';
      case 'hit_sl':
        return 'Stop loss level was reached';
      case 'hit_tp1':
        return 'First take profit target reached';
      case 'hit_tp2':
        return 'Second take profit target reached';
      case 'market_invalid':
        return 'Market trend changed, signal no longer valid';
      case 'technical_invalid':
        return 'Technical indicators changed, signal invalid';
      case 'expired':
        return 'Signal expired due to time limit';
      default:
        return 'Status unknown';
    }
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case '5m':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case '15m':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '1h':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '4h':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '1d':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getMarketTrendIcon = (trend) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      case 'sideways':
        return <MinusIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMarketTrendColor = (trend) => {
    switch (trend) {
      case 'bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'sideways':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
    return price.toFixed(4);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const formatTimeframe = (timeframe) => {
    const timeframeMap = {
      '5m': '5 Min',
      '15m': '15 Min',
      '1h': '1 Hour',
      '4h': '4 Hour',
      '1d': '1 Day'
    };
    return timeframeMap[timeframe] || timeframe;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg ${isDark ? 'hover:border-gray-600' : 'hover:border-gray-300'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getRecommendationIcon(signal.recommendation)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {signal.pair}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(signal.recommendation)}`}>
                  {signal.recommendation}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTimeframeColor(signal.timeframe)}`}>
                  {formatTimeframe(signal.timeframe)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(signal.status)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(signal.status)}
                <span>{getStatusText(signal.status)}</span>
              </div>
            </span>
          </div>
        </div>

        {/* Market Trend */}
        {signal.marketTrend && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Market Trend:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMarketTrendColor(signal.marketTrend.currentTrend)}`}>
                <div className="flex items-center space-x-1">
                  {getMarketTrendIcon(signal.marketTrend.currentTrend)}
                  <span className="capitalize">{signal.marketTrend.currentTrend}</span>
                </div>
              </span>
            </div>
            {signal.marketTrend.trendStrength > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Strength: {signal.marketTrend.trendStrength.toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Current:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              ${formatPrice(signal.currentPrice)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Stop Loss:</span>
            <div className="font-medium text-red-600 dark:text-red-400">
              ${formatPrice(signal.stopLoss)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">TP1:</span>
            <div className="font-medium text-green-600 dark:text-green-400">
              ${formatPrice(signal.takeProfit1)}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">TP2:</span>
              <div className="font-medium text-green-600 dark:text-green-400">
                ${formatPrice(signal.takeProfit2)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Risk/Reward:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {signal.riskRewardRatio.toFixed(2)}:1
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {signal.confidence}%
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatTime(signal.createdAt)}
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Indicators</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`px-2 py-1 rounded ${signal.technicalIndicators.ema === 'bullish' ? 'bg-green-100 text-green-800' : signal.technicalIndicators.ema === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                EMA: {signal.technicalIndicators.ema}
              </div>
              <div className={`px-2 py-1 rounded ${signal.technicalIndicators.rsi === 'oversold' ? 'bg-green-100 text-green-800' : signal.technicalIndicators.rsi === 'overbought' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                RSI: {signal.technicalIndicators.rsi}
              </div>
              <div className={`px-2 py-1 rounded ${signal.technicalIndicators.macd === 'bullish' ? 'bg-green-100 text-green-800' : signal.technicalIndicators.macd === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                MACD: {signal.technicalIndicators.macd}
              </div>
            </div>
          </div>

          {/* Signal Logic */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Signal Logic</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{signal.logic}</p>
          </div>

          {/* Outcome Information */}
          {signal.outcome && signal.outcome.outcomeType && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Outcome</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Type: {signal.outcome.outcomeType.replace('_', ' ').toUpperCase()}</div>
                {signal.outcome.reason && <div>Reason: {signal.outcome.reason}</div>}
                {signal.outcome.finalPrice && <div>Final Price: ${formatPrice(signal.outcome.finalPrice)}</div>}
                {signal.outcome.profitLoss !== undefined && (
                  <div className={`font-medium ${signal.outcome.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    P&L: {formatPercentage(signal.outcome.profitLoss)}
                  </div>
                )}
                {signal.outcome.closedAt && <div>Closed: {formatTime(signal.outcome.closedAt)}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{formatTime(signal.createdAt)}</span>
            {signal.lastPriceCheck && (
              <span>Last Check: {formatTime(signal.lastPriceCheck)}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showDetails ? 'Hide' : 'Details'}</span>
            </button>
            
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(signal)}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                View Chart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
