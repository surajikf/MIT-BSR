const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true,
    enum: [
      // Crypto pairs
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT',
      // Major forex pairs
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
      // Cross pairs
      'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/CHF',
      // Commodity pairs
      'USD/INR', 'USD/CNY', 'USD/BRL', 'USD/MXN', 'USD/ZAR'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['crypto', 'forex']
  },
  timeframe: {
    type: String,
    required: true,
    enum: ['5m', '15m', '1h', '4h', '1d'],
    default: '15m'
  },
  recommendation: {
    type: String,
    required: true,
    enum: ['BUY', 'SELL', 'HOLD']
  },
  currentPrice: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  takeProfit1: {
    type: Number,
    required: true
  },
  takeProfit2: {
    type: Number,
    required: true
  },
  riskRewardRatio: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  technicalIndicators: {
    ema: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral']
    },
    rsi: {
      type: String,
      enum: ['oversold', 'overbought', 'neutral']
    },
    macd: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral']
    }
  },
  logic: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    required: true,
    enum: [
      'active',           // Still running - signal is active and valid
      'hit_sl',           // Stop loss hit - signal closed with loss
      'hit_tp1',          // Take profit 1 hit - signal closed with profit
      'hit_tp2',          // Take profit 2 hit - signal closed with max profit
      'expired',          // Time expired - signal no longer valid
      'market_invalid',   // Market trend changed - signal no longer valid
      'technical_invalid' // Technical indicators changed - signal no longer valid
    ],
    default: 'active'
  },
  marketTrend: {
    currentTrend: {
      type: String,
      enum: ['bullish', 'bearish', 'sideways', 'unknown'],
      default: 'unknown'
    },
    trendStrength: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  outcome: {
    finalPrice: Number,
    profitLoss: Number,
    outcomeType: {
      type: String,
      enum: ['hit_sl', 'hit_tp1', 'hit_tp2', 'expired', 'market_invalid', 'technical_invalid']
    },
    closedAt: Date,
    reason: String
  },
  alerts: {
    stopLossHit: {
      type: Boolean,
      default: false
    },
    takeProfit1Hit: {
      type: Boolean,
      default: false
    },
    takeProfit2Hit: {
      type: Boolean,
      default: false
    }
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Signals expire after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  lastPriceCheck: {
    type: Date,
    default: Date.now
  },
  priceHistory: [{
    price: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
signalSchema.index({ pair: 1, status: 1, timeframe: 1, createdAt: -1 });
signalSchema.index({ generatedBy: 1, createdAt: -1 });
signalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
signalSchema.index({ status: 1, timeframe: 1 });

// Calculate risk/reward ratio
signalSchema.methods.calculateRiskReward = function() {
  if (this.recommendation === 'BUY') {
    const risk = this.currentPrice - this.stopLoss;
    const reward = this.takeProfit1 - this.currentPrice;
    return reward / risk;
  } else if (this.recommendation === 'SELL') {
    const risk = this.stopLoss - this.currentPrice;
    const reward = this.currentPrice - this.takeProfit1;
    return reward / risk;
  }
  return 0;
};

// Check if signal is expired
signalSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if signal is still valid based on market conditions
signalSchema.methods.isMarketValid = function(currentTrend) {
  if (this.status !== 'active') return false;
  
  // If market trend changed significantly, mark as invalid
  if (this.marketTrend.currentTrend !== 'unknown' && 
      this.marketTrend.currentTrend !== currentTrend) {
    return false;
  }
  
  return true;
};

// Update signal status based on current price and market conditions
signalSchema.methods.updateStatus = function(currentPrice, currentTrend) {
  if (this.status !== 'active') return this.status;
  
  // Update price history
  this.priceHistory.push({
    price: currentPrice,
    timestamp: new Date()
  });
  
  // Keep only last 100 price points
  if (this.priceHistory.length > 100) {
    this.priceHistory = this.priceHistory.slice(-100);
  }
  
  this.lastPriceCheck = new Date();
  
  // Check market validity first
  if (!this.isMarketValid(currentTrend)) {
    this.status = 'market_invalid';
    this.outcome = {
      finalPrice: currentPrice,
      profitLoss: 0,
      outcomeType: 'market_invalid',
      closedAt: new Date(),
      reason: 'Market trend changed, signal no longer valid'
    };
    return this.status;
  }
  
  // Check technical validity
  if (this.isExpired()) {
    this.status = 'expired';
    this.outcome = {
      finalPrice: currentPrice,
      profitLoss: 0,
      outcomeType: 'expired',
      closedAt: new Date(),
      reason: 'Signal expired due to time limit'
    };
    return this.status;
  }
  
  // Check price-based outcomes
  if (this.recommendation === 'BUY') {
    if (currentPrice <= this.stopLoss) {
      this.status = 'hit_sl';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((currentPrice - this.currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_sl',
        closedAt: new Date(),
        reason: 'Stop loss hit'
      };
    } else if (currentPrice >= this.takeProfit2) {
      this.status = 'hit_tp2';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((currentPrice - this.currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_tp2',
        closedAt: new Date(),
        reason: 'Take profit 2 hit'
      };
    } else if (currentPrice >= this.takeProfit1) {
      this.status = 'hit_tp1';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((currentPrice - this.currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_tp1',
        closedAt: new Date(),
        reason: 'Take profit 1 hit'
      };
    }
  } else if (this.recommendation === 'SELL') {
    if (currentPrice >= this.stopLoss) {
      this.status = 'hit_sl';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((this.currentPrice - currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_sl',
        closedAt: new Date(),
        reason: 'Stop loss hit'
      };
    } else if (currentPrice <= this.takeProfit2) {
      this.status = 'hit_tp2';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((this.currentPrice - currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_tp2',
        closedAt: new Date(),
        reason: 'Take profit 2 hit'
      };
    } else if (currentPrice <= this.takeProfit1) {
      this.status = 'hit_tp1';
      this.outcome = {
        finalPrice: currentPrice,
        profitLoss: ((this.currentPrice - currentPrice) / this.currentPrice) * 100,
        outcomeType: 'hit_tp1',
        closedAt: new Date(),
        reason: 'Take profit 1 hit'
      };
    }
  }
  
  return this.status;
};

// Update market trend
signalSchema.methods.updateMarketTrend = function(trend, strength) {
  this.marketTrend.currentTrend = trend;
  this.marketTrend.trendStrength = strength;
  this.marketTrend.lastUpdated = new Date();
};

module.exports = mongoose.model('Signal', signalSchema);
