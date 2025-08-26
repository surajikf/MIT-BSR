import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bitcoin, 
  DollarSign,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import SignalCard from '../components/Signals/SignalCard';
import ChartContainer from '../components/Charts/ChartContainer';

const Dashboard = () => {
  const { isConnected, lastMessage } = useSocket();
  const [signals, setSignals] = useState([]);
  const [marketSummary, setMarketSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signalFilter, setSignalFilter] = useState('all');

  // Mock data for demo
  useEffect(() => {
    const mockSignals = [
      {
        id: 1,
        pair: 'BTC/USDT',
        type: 'crypto',
        recommendation: 'BUY',
        currentPrice: 110059,
        stopLoss: 108400,
        takeProfit1: 112200,
        takeProfit2: 115500,
        riskRewardRatio: 2.1,
        confidence: 85,
        status: 'active',
        technicalIndicators: {
          ema: 'bullish',
          rsi: 'oversold',
          macd: 'bullish'
        },
        logic: 'Signal generated based on technical analysis: EMA shows bullish momentum. RSI indicates oversold conditions. MACD shows bullish crossover. Recommendation: BUY with calculated stop-loss and take-profit levels.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        generatedBy: { username: 'System' }
      },
      {
        id: 2,
        pair: 'EUR/USD',
        type: 'forex',
        recommendation: 'SELL',
        currentPrice: 1.0850,
        stopLoss: 1.0920,
        takeProfit1: 1.0780,
        takeProfit2: 1.0650,
        riskRewardRatio: 1.8,
        confidence: 72,
        status: 'active',
        technicalIndicators: {
          ema: 'bearish',
          rsi: 'overbought',
          macd: 'bearish'
        },
        logic: 'Signal generated based on technical analysis: EMA shows bearish momentum. RSI indicates overbought conditions. MACD shows bearish crossover. Recommendation: SELL with calculated stop-loss and take-profit levels.',
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        generatedBy: { username: 'System' }
      },
      {
        id: 3,
        pair: 'ETH/USDT',
        type: 'crypto',
        recommendation: 'BUY',
        currentPrice: 3250,
        stopLoss: 3180,
        takeProfit1: 3320,
        takeProfit2: 3450,
        riskRewardRatio: 2.5,
        confidence: 78,
        status: 'hit_tp1',
        technicalIndicators: {
          ema: 'bullish',
          rsi: 'neutral',
          macd: 'bullish'
        },
        logic: 'Signal generated based on technical analysis: EMA shows bullish momentum. RSI indicates neutral conditions. MACD shows bullish crossover. Recommendation: BUY with calculated stop-loss and take-profit levels.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        generatedBy: { username: 'System' },
        outcome: {
          finalPrice: 3320,
          profitLoss: 2.15,
          outcomeType: 'hit_tp1',
          closedAt: new Date(Date.now() - 30 * 60 * 1000)
        }
      },
      {
        id: 4,
        pair: 'GBP/USD',
        type: 'forex',
        recommendation: 'BUY',
        currentPrice: 1.2650,
        stopLoss: 1.2580,
        takeProfit1: 1.2720,
        takeProfit2: 1.2850,
        riskRewardRatio: 2.8,
        confidence: 91,
        status: 'active',
        technicalIndicators: {
          ema: 'bullish',
          rsi: 'oversold',
          macd: 'bullish'
        },
        logic: 'Strong bullish momentum detected: EMA trending upward, RSI showing oversold conditions, MACD bullish crossover confirmed. High probability setup with excellent risk/reward ratio.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        generatedBy: { username: 'System' }
      },
      {
        id: 5,
        pair: 'ADA/USDT',
        type: 'crypto',
        recommendation: 'SELL',
        currentPrice: 0.4850,
        stopLoss: 0.4950,
        takeProfit1: 0.4750,
        takeProfit2: 0.4550,
        riskRewardRatio: 2.0,
        confidence: 68,
        status: 'active',
        technicalIndicators: {
          ema: 'bearish',
          rsi: 'overbought',
          macd: 'bearish'
        },
        logic: 'Bearish reversal pattern: EMA showing downward momentum, RSI overbought conditions, MACD bearish crossover. Potential short opportunity with defined risk levels.',
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        generatedBy: { username: 'System' }
      },
      {
        id: 6,
        pair: 'USD/JPY',
        type: 'forex',
        recommendation: 'BUY',
        currentPrice: 148.50,
        stopLoss: 147.80,
        takeProfit1: 149.20,
        takeProfit2: 150.50,
        riskRewardRatio: 2.2,
        confidence: 76,
        status: 'active',
        technicalIndicators: {
          ema: 'bullish',
          rsi: 'neutral',
          macd: 'bullish'
        },
        logic: 'USD strength continues: EMA bullish trend, RSI neutral territory, MACD positive momentum. Dollar yen pair showing continued upward pressure.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        generatedBy: { username: 'System' }
      }
    ];

    const mockMarketSummary = {
      crypto: [
        { pair: 'BTC/USDT', price: 110059, change: 2.5, volume: 25000000 },
        { pair: 'ETH/USDT', price: 3250, change: 1.8, volume: 15000000 },
        { pair: 'BNB/USDT', price: 580, change: -0.5, volume: 8000000 }
      ],
      forex: [
        { pair: 'EUR/USD', price: 1.0850, change: 0.15, volume: 1500000 },
        { pair: 'GBP/USD', price: 1.2650, change: -0.25, volume: 1200000 },
        { pair: 'USD/JPY', price: 149.50, change: 0.30, volume: 2000000 }
      ],
      timestamp: new Date()
    };

    setSignals(mockSignals);
    setMarketSummary(mockMarketSummary);
    setIsLoading(false);
  }, []);

  // Update data when socket receives new messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'signals:update':
          setSignals(lastMessage.data);
          break;
        case 'market:summary':
          setMarketSummary(lastMessage.data);
          break;
        case 'signal:new':
          setSignals(prev => [lastMessage.data, ...prev]);
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  const handleViewDetails = (signal) => {
    console.log('Viewing signal details:', signal);
    // Implement signal details modal/page
  };

  const getStats = () => {
    const activeSignals = signals.filter(s => s.status === 'active');
    const successfulSignals = signals.filter(s => s.status === 'hit_tp1' || s.status === 'hit_tp2');
    const stopLossSignals = signals.filter(s => s.status === 'hit_sl');
    
    return {
      total: signals.length,
      active: activeSignals.length,
      successful: successfulSignals.length,
      stopLoss: stopLossSignals.length,
      successRate: signals.length > 0 ? ((successfulSignals.length / signals.length) * 100).toFixed(1) : 0
    };
  };

  const getFilteredSignals = () => {
    let filtered = [...signals];
    
    switch (signalFilter) {
      case 'crypto':
        filtered = filtered.filter(s => s.type === 'crypto');
        break;
      case 'forex':
        filtered = filtered.filter(s => s.type === 'forex');
        break;
      case 'buy':
        filtered = filtered.filter(s => s.recommendation === 'BUY');
        break;
      case 'sell':
        filtered = filtered.filter(s => s.recommendation === 'SELL');
        break;
      case 'high-confidence':
        filtered = filtered.filter(s => s.confidence >= 80);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Market overview and trading signals summary
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Signals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stop Loss Hit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stopLoss}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crypto Market */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bitcoin className="h-5 w-5 text-orange-500 mr-2" />
              Crypto Market
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated {marketSummary?.timestamp ? new Date(marketSummary.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
          <div className="space-y-3">
            {marketSummary?.crypto?.map((item) => (
              <div key={item.pair} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">{item.pair}</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${item.price.toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    item.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forex Market */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              Forex Market
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated {marketSummary?.timestamp ? new Date(marketSummary.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
          <div className="space-y-3">
            {marketSummary?.forex?.map((item) => (
              <div key={item.pair} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">{item.pair}</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item.price.toFixed(4)}
                  </div>
                  <div className={`text-sm ${
                    item.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Chart</h2>
        <ChartContainer />
      </div>

      {/* Advanced Recent Signals Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Trading Signals</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time trading recommendations with advanced analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
              <select 
                value={signalFilter} 
                onChange={(e) => setSignalFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Signals</option>
                <option value="crypto">Crypto Only</option>
                <option value="forex">Forex Only</option>
                <option value="buy">Buy Signals</option>
                <option value="sell">Sell Signals</option>
                <option value="high-confidence">High Confidence</option>
              </select>
            </div>
            <button className="btn-outline text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View All
            </button>
          </div>
        </div>

        {/* Signal Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {signals.filter(s => s.recommendation === 'BUY').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Buy Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {signals.filter(s => s.recommendation === 'SELL').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sell Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {signals.filter(s => s.confidence >= 80).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">High Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {signals.filter(s => s.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
          </div>
        </div>
        
        {signals.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No signals available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Enhanced Signal Cards */}
            {getFilteredSignals().slice(0, 6).map((signal) => (
              <div key={signal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      signal.recommendation === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {signal.pair}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          signal.recommendation === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {signal.recommendation}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          signal.type === 'crypto' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {signal.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {signal.type === 'crypto' ? '$' : ''}{signal.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Confidence: {signal.confidence}%
                    </div>
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">EMA</div>
                    <div className={`text-sm font-medium ${
                      signal.technicalIndicators.ema === 'bullish' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {signal.technicalIndicators.ema === 'bullish' ? '📈' : '📉'} {signal.technicalIndicators.ema}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">RSI</div>
                    <div className={`text-sm font-medium ${
                      signal.technicalIndicators.rsi === 'oversold' ? 'text-green-600 dark:text-green-400' : 
                      signal.technicalIndicators.rsi === 'overbought' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {signal.technicalIndicators.rsi === 'oversold' ? '📉' : 
                       signal.technicalIndicators.rsi === 'overbought' ? '📈' : '➡️'} {signal.technicalIndicators.rsi}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">MACD</div>
                    <div className={`text-sm font-medium ${
                      signal.technicalIndicators.macd === 'bullish' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {signal.technicalIndicators.macd === 'bullish' ? '📈' : '📉'} {signal.technicalIndicators.macd}
                    </div>
                  </div>
                </div>

                {/* Risk Management */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stop Loss</div>
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">
                      {signal.type === 'crypto' ? '$' : ''}{signal.stopLoss.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Risk/Reward</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {signal.riskRewardRatio}:1
                    </div>
                  </div>
                </div>

                {/* Take Profit Levels */}
                <div className="mb-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Take Profit Levels</div>
                  <div className="flex gap-2">
                    <div className="flex-1 text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-xs text-gray-600 dark:text-gray-400">TP1</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {signal.type === 'crypto' ? '$' : ''}{signal.takeProfit1.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-xs text-gray-600 dark:text-gray-400">TP2</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {signal.type === 'crypto' ? '$' : ''}{signal.takeProfit2.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signal Logic & Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Signal Logic</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {signal.logic}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Generated {getTimeAgo(signal.createdAt)} ago
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Set Alert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {signals.length > 6 && (
          <div className="text-center mt-6">
            <button className="btn btn-outline">
              Load More Signals
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
