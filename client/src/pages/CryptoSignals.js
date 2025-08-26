import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import SignalCard from '../components/Signals/SignalCard';
import SignalStats from '../components/Signals/SignalStats';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CryptoSignals = () => {
  const { socket, lastMessage } = useSocket();
  const { isDark } = useTheme();
  const [signals, setSignals] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    recommendation: 'all',
    status: 'all',
    timeframe: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'signals:update') {
      const cryptoSignals = lastMessage.data.filter(signal => 
        signal.pair.includes('BTC') || signal.pair.includes('ETH') || signal.pair.includes('USDT')
      );
      setSignals(cryptoSignals);
      setIsLoading(false);
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
    if (filters.timeframe !== 'all') {
      filtered = filtered.filter(signal => signal.timeframe === filters.timeframe);
    }
    if (filters.search) {
      filtered = filtered.filter(signal => 
        signal.pair.toLowerCase().includes(filters.search.toLowerCase())
      );
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
        default:
          return 0;
      }
    });

    setFilteredSignals(filtered);
  }, [signals, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      recommendation: 'all',
      status: 'all',
      timeframe: 'all',
      search: ''
    });
  };

  const refreshSignals = () => {
    setIsLoading(true);
    if (socket) {
      socket.emit('signals:request');
    }
  };

  // Group signals by status for better organization
  const groupedSignals = {
    active: filteredSignals.filter(s => s.status === 'active'),
    running: filteredSignals.filter(s => s.status === 'active'),
    hit_sl: filteredSignals.filter(s => s.status === 'hit_sl'),
    hit_tp1: filteredSignals.filter(s => s.status === 'hit_tp1'),
    hit_tp2: filteredSignals.filter(s => s.status === 'hit_tp2'),
    market_invalid: filteredSignals.filter(s => s.status === 'market_invalid'),
    technical_invalid: filteredSignals.filter(s => s.status === 'technical_invalid'),
    expired: filteredSignals.filter(s => s.status === 'expired')
  };

  const getStatusCount = (status) => {
    return groupedSignals[status]?.length || 0;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'hit_sl':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'hit_tp1':
      case 'hit_tp2':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'market_invalid':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'technical_invalid':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'running':
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading crypto signals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crypto Trading Signals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time buy/sell signals for cryptocurrency pairs with multiple timeframes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Recommendation Filter */}
            <select
              value={filters.recommendation}
              onChange={(e) => handleFilterChange('recommendation', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Recommendations</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Still Running</option>
              <option value="hit_sl">Stop Loss Hit</option>
              <option value="hit_tp1">TP1 Hit</option>
              <option value="hit_tp2">TP2 Hit</option>
              <option value="market_invalid">Market Invalid</option>
              <option value="technical_invalid">Technical Invalid</option>
              <option value="expired">Expired</option>
            </select>

            {/* Timeframe Filter */}
            <select
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Timeframes</option>
              <option value="5m">5 Min</option>
              <option value="15m">15 Min</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hour</option>
              <option value="1d">1 Day</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Newest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="riskRewardRatio">Best Risk/Reward</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              Clear
            </button>

            {/* Refresh */}
            <button
              onClick={refreshSignals}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Signals ({filteredSignals.length})
            </button>
            
            {Object.keys(groupedSignals).map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                  activeTab === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getStatusIcon(status)}
                <span>{getStatusLabel(status)}</span>
                <span className="ml-1">({getStatusCount(status)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Signal Statistics */}
        <div className="mb-6">
          <SignalStats signals={filteredSignals} type="crypto" />
        </div>

        {/* Signals Grid */}
        {activeTab === 'all' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal._id}
                signal={signal}
                onViewDetails={(signal) => {
                  // Handle view details - could open chart or detailed view
                  console.log('View details for:', signal);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedSignals[activeTab]?.map((signal) => (
              <SignalCard
                key={signal._id}
                signal={signal}
                onViewDetails={(signal) => {
                  // Handle view details - could open chart or detailed view
                  console.log('View details for:', signal);
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSignals.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No signals found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or refresh to get the latest signals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoSignals;
