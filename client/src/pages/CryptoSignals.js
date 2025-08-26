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
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [activeTab, setActiveTab] = useState('all'); // New state for status tabs

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
      search: ''
    });
  };

  const refreshSignals = () => {
    setIsLoading(true);
    if (socket) {
      socket.emit('signals:request');
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

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'closed':
        return 'Closed';
      case 'expired':
        return 'Expired';
      default:
        return 'All';
    }
  };

  // Helper function to get status count
  const getStatusCount = (status) => {
    return filteredSignals.filter(s => s.status === status).length;
  };

  // Group signals by status
  const groupedSignals = {
    all: filteredSignals,
    active: filteredSignals.filter(s => s.status === 'active'),
    closed: filteredSignals.filter(s => s.status === 'closed'),
    expired: filteredSignals.filter(s => s.status === 'expired'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crypto Trading Signals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time buy/sell recommendations for cryptocurrency pairs
          </p>
        </div>
        <button
          onClick={refreshSignals}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Buy Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredSignals.filter(s => s.recommendation === 'buy').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sell Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredSignals.filter(s => s.recommendation === 'sell').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredSignals.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Signals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredSignals.length}
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
                placeholder="Search by pair (e.g., BTC/USDT)"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Recommendation Filter */}
          <div className="flex gap-2">
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
    </div>
  );
};

export default CryptoSignals;
