import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

const History = () => {
  const { socket, lastMessage } = useSocket();
  const { isDark } = useTheme();
  const [signals, setSignals] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    recommendation: 'all',
    status: 'all',
    search: '',
    dateRange: '30d'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [performance, setPerformance] = useState({
    totalSignals: 0,
    successfulSignals: 0,
    successRate: 0,
    totalProfit: 0,
    averageProfit: 0
  });

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'signals:update') {
      setSignals(lastMessage.data);
      setIsLoading(false);
      calculatePerformance(lastMessage.data);
    }
  }, [lastMessage]);

  useEffect(() => {
    let filtered = [...signals];

    // Apply filters
    if (filters.recommendation !== 'all') {
      filtered = filtered.filter(signal => signal.recommendation === filters.recommendation);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(signal => signal.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(signal => 
        signal.pair.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply date range filter
    const now = new Date();
    const daysAgo = parseInt(filters.dateRange);
    if (daysAgo > 0) {
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(signal => new Date(signal.createdAt) >= cutoffDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'riskRewardRatio':
          return b.riskRewardRatio - a.riskRewardRatio;
        case 'outcome':
          return (b.outcome || '').localeCompare(a.outcome || '');
        default:
          return 0;
      }
    });

    setFilteredSignals(filtered);
  }, [signals, filters, sortBy]);

  const calculatePerformance = (signalData) => {
    const total = signalData.length;
    const successful = signalData.filter(s => s.outcome === 'TP1 Hit' || s.outcome === 'TP2 Hit').length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    // Mock profit calculation (in real app, this would be calculated from actual trades)
    const totalProfit = signalData.reduce((sum, signal) => {
      if (signal.outcome === 'TP1 Hit') return sum + 2; // 2% profit
      if (signal.outcome === 'TP2 Hit') return sum + 5; // 5% profit
      if (signal.outcome === 'Stop Loss Hit') return sum - 1.5; // 1.5% loss
      return sum;
    }, 0);

    setPerformance({
      totalSignals: total,
      successfulSignals: successful,
      successRate: successRate.toFixed(1),
      totalProfit: totalProfit.toFixed(2),
      averageProfit: total > 0 ? (totalProfit / total).toFixed(2) : 0
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      recommendation: 'all',
      status: 'all',
      search: '',
      dateRange: '30d'
    });
  };

  const refreshHistory = () => {
    setIsLoading(true);
    if (socket) {
      socket.emit('signals:request');
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Pair', 'Recommendation', 'Entry Price', 'Stop Loss', 'Take Profit 1', 'Take Profit 2', 'Status', 'Outcome', 'Created At'],
      ...filteredSignals.map(signal => [
        signal.pair,
        signal.recommendation,
        signal.currentPrice,
        signal.stopLoss,
        signal.takeProfit1,
        signal.takeProfit2,
        signal.status,
        signal.outcome || 'Active',
        new Date(signal.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOutcomeColor = (outcome) => {
    if (outcome === 'TP1 Hit' || outcome === 'TP2 Hit') return 'text-green-600 dark:text-green-400';
    if (outcome === 'Stop Loss Hit') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading trading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trading History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your trading performance and analyze past signals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportHistory}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={refreshHistory}
            className="btn btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {performance.totalSignals}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {performance.successfulSignals}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {performance.successRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
              <p className={`text-xl font-semibold ${parseFloat(performance.totalProfit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {performance.totalProfit}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Profit</p>
              <p className={`text-xl font-semibold ${parseFloat(performance.averageProfit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {performance.averageProfit}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by pair or outcome..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
              <option value="0">All time</option>
            </select>

            <select
              value={filters.recommendation}
              onChange={(e) => handleFilterChange('recommendation', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Recommendations</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="hold">Hold</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Latest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="riskRewardRatio">Best Risk/Reward</option>
              <option value="outcome">Outcome</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recommendation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stop Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Take Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSignals.map((signal) => (
                <tr key={signal._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {signal.pair}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      signal.recommendation === 'buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : signal.recommendation === 'sell'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {signal.recommendation.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {signal.currentPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    {signal.stopLoss}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>TP1: {signal.takeProfit1}</div>
                      <div>TP2: {signal.takeProfit2}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      signal.status === 'active' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : signal.status === 'closed'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {signal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${getOutcomeColor(signal.outcome)}`}>
                      {signal.outcome || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(signal.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSignals.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No history found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search || filters.recommendation !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No trading history available at the moment.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
