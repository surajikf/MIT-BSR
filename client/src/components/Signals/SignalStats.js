import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  XCircle,
  DollarSign,
  Percent,
  Target
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SignalStats = ({ signals, type = 'all' }) => {
  const { isDark } = useTheme();

  // Calculate statistics
  const totalSignals = signals.length;
  const activeSignals = signals.filter(s => s.status === 'active').length;
  const buySignals = signals.filter(s => s.recommendation === 'BUY').length;
  const sellSignals = signals.filter(s => s.recommendation === 'SELL').length;
  
  // Status breakdown
  const statusBreakdown = {
    active: signals.filter(s => s.status === 'active').length,
    hit_sl: signals.filter(s => s.status === 'hit_sl').length,
    hit_tp1: signals.filter(s => s.status === 'hit_tp1').length,
    hit_tp2: signals.filter(s => s.status === 'hit_tp2').length,
    market_invalid: signals.filter(s => s.status === 'market_invalid').length,
    technical_invalid: signals.filter(s => s.status === 'technical_invalid').length,
    expired: signals.filter(s => s.status === 'expired').length
  };

  // Timeframe breakdown
  const timeframeBreakdown = {
    '5m': signals.filter(s => s.timeframe === '5m').length,
    '15m': signals.filter(s => s.timeframe === '15m').length,
    '1h': signals.filter(s => s.timeframe === '1h').length,
    '4h': signals.filter(s => s.timeframe === '4h').length,
    '1d': signals.filter(s => s.timeframe === '1d').length
  };

  // Performance metrics
  const closedSignals = signals.filter(s => s.status !== 'active');
  const profitableSignals = closedSignals.filter(s => 
    s.outcome && s.outcome.profitLoss && s.outcome.profitLoss > 0
  ).length;
  const lossSignals = closedSignals.filter(s => 
    s.outcome && s.outcome.profitLoss && s.outcome.profitLoss < 0
  ).length;
  
  const successRate = closedSignals.length > 0 ? (profitableSignals / closedSignals.length) * 100 : 0;
  const avgConfidence = signals.length > 0 ? 
    (signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length).toFixed(1) : 0;

  // Average risk/reward ratio
  const avgRiskReward = signals.length > 0 ? 
    (signals.reduce((sum, s) => sum + s.riskRewardRatio, 0) / signals.length).toFixed(2) : 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'hit_sl':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'hit_tp1':
      case 'hit_tp2':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'market_invalid':
        return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'technical_invalid':
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const getStatusLabel = (status) => {
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
        return 'Market Invalid';
      case 'technical_invalid':
        return 'Technical Invalid';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getTimeframeLabel = (timeframe) => {
    const labels = {
      '5m': '5 Min',
      '15m': '15 Min',
      '1h': '1 Hour',
      '4h': '4 Hour',
      '1d': '1 Day'
    };
    return labels[timeframe] || timeframe;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSignals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buy Signals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{buySignals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sell Signals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellSignals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSignals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Percent className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{successRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgConfidence}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Risk/Reward</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRiskReward}:1</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profitable</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profitableSignals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Signal Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getStatusLabel(status)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeframe Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeframe Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(timeframeBreakdown).map(([timeframe, count]) => (
            <div key={timeframe} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getTimeframeColor(timeframe)}`}>
                <span className="text-sm font-medium">{timeframe}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeframeLabel(timeframe)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Type Summary */}
      {type !== 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {type === 'crypto' ? 'Cryptocurrency' : 'Forex'} Market Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{type}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pairs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Set(signals.map(s => s.pair)).size}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Signals</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{activeSignals}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalStats;
