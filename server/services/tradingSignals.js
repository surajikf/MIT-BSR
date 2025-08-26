const Signal = require('../models/Signal');
const axios = require('axios');

class TradingSignalsService {
  constructor(io) {
    this.io = io;
    this.binanceBaseUrl = 'https://api.binance.com/api/v3';
    this.alphaVantageBaseUrl = 'https://www.alphavantage.co/query';
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.timeframes = ['5m', '15m']; // Support for 5min and 15min charts
  }

  // Generate signals for all trading pairs and timeframes
  async generateAllSignals(userId) {
    try {
      const signals = [];
      
      // Generate signals for each timeframe
      for (const timeframe of this.timeframes) {
        // Generate crypto signals
        const cryptoSignals = await this.generateCryptoSignals(userId, timeframe);
        signals.push(...cryptoSignals);
        
        // Generate forex signals
        const forexSignals = await this.generateForexSignals(userId, timeframe);
        signals.push(...forexSignals);
      }
      
      // Emit signals to connected clients
      this.io.emit('signals:update', signals);
      
      return signals;
    } catch (error) {
      console.error('❌ Error generating signals:', error);
      throw error;
    }
  }

  // Generate crypto signals for specific timeframe
  async generateCryptoSignals(userId, timeframe = '15m') {
    const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    const signals = [];

    for (const pair of cryptoPairs) {
      try {
        const symbol = pair.replace('/', '');
        const priceData = await this.getBinancePrice(symbol, timeframe);
        
        if (priceData) {
          const signal = await this.generateSignal(pair, 'crypto', priceData, userId, timeframe);
          if (signal) {
            signals.push(signal);
          }
        }
      } catch (error) {
        console.error(`❌ Error generating signal for ${pair} (${timeframe}):`, error);
      }
    }

    return signals;
  }

  // Generate forex signals for specific timeframe
  async generateForexSignals(userId, timeframe = '15m') {
    const forexPairs = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
      'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/CHF',
      'USD/INR', 'USD/CNY', 'USD/BRL', 'USD/MXN', 'USD/ZAR'
    ];
    const signals = [];

    for (const pair of forexPairs) {
      try {
        const priceData = await this.getForexPrice(pair, timeframe);
        
        if (priceData) {
          const signal = await this.generateSignal(pair, 'forex', priceData, userId, timeframe);
          if (signal) {
            signals.push(signal);
          }
        }
      } catch (error) {
        console.error(`❌ Error generating signal for ${pair} (${timeframe}):`, error);
      }
    }

    return signals;
  }

  // Generate individual signal with timeframe
  async generateSignal(pair, type, priceData, userId, timeframe = '15m') {
    try {
      // Get technical indicators for specific timeframe
      const indicators = await this.calculateTechnicalIndicators(pair, type, timeframe);
      
      // Determine recommendation based on indicators
      const recommendation = this.determineRecommendation(indicators);
      
      if (recommendation === 'HOLD') {
        return null; // Don't create signals for HOLD recommendations
      }

      // Calculate price levels
      const currentPrice = priceData.price;
      const stopLossPercent = process.env.DEFAULT_STOP_LOSS_PERCENT || 1.5;
      const takeProfit1Percent = process.env.DEFAULT_TAKE_PROFIT_1_PERCENT || 2.0;
      const takeProfit2Percent = process.env.DEFAULT_TAKE_PROFIT_2_PERCENT || 5.0;

      let stopLoss, takeProfit1, takeProfit2;

      if (recommendation === 'BUY') {
        stopLoss = currentPrice * (1 - stopLossPercent / 100);
        takeProfit1 = currentPrice * (1 + takeProfit1Percent / 100);
        takeProfit2 = currentPrice * (1 + takeProfit2Percent / 100);
      } else {
        stopLoss = currentPrice * (1 + stopLossPercent / 100);
        takeProfit1 = currentPrice * (1 - takeProfit1Percent / 100);
        takeProfit2 = currentPrice * (1 - takeProfit2Percent / 100);
      }

      // Calculate risk/reward ratio
      const riskRewardRatio = this.calculateRiskRewardRatio(
        currentPrice, stopLoss, takeProfit1
      );

      // Calculate confidence based on indicator alignment
      const confidence = this.calculateConfidence(indicators);

      // Determine market trend
      const marketTrend = this.determineMarketTrend(indicators, priceData);

      // Create signal
      const signal = new Signal({
        pair,
        type,
        timeframe,
        recommendation,
        currentPrice,
        stopLoss,
        takeProfit1,
        takeProfit2,
        riskRewardRatio,
        confidence,
        technicalIndicators: indicators,
        logic: this.generateSignalLogic(indicators, recommendation),
        marketTrend,
        generatedBy: userId
      });

      await signal.save();
      return signal;
    } catch (error) {
      console.error(`❌ Error generating signal for ${pair}:`, error);
      return null;
    }
  }

  // Get Binance price data for specific timeframe
  async getBinancePrice(symbol, timeframe = '15m') {
    try {
      // Convert timeframe to Binance interval
      const intervalMap = {
        '5m': '5m',
        '15m': '15m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d'
      };
      
      const interval = intervalMap[timeframe] || '15m';
      
      // Get kline data for technical analysis
      const klineResponse = await axios.get(`${this.binanceBaseUrl}/klines`, {
        params: {
          symbol,
          interval,
          limit: 100
        }
      });

      if (klineResponse.data && klineResponse.data.length > 0) {
        const latestKline = klineResponse.data[klineResponse.data.length - 1];
        const price = parseFloat(latestKline[4]); // Close price
        
        return {
          price,
          klines: klineResponse.data,
          interval,
          timestamp: new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching Binance price for ${symbol}:`, error);
      return null;
    }
  }

  // Get Forex price data for specific timeframe
  async getForexPrice(pair, timeframe = '15m') {
    try {
      // Alpha Vantage supports different intervals
      const intervalMap = {
        '5m': '5min',
        '15m': '15min',
        '1h': '60min',
        '4h': 'daily',
        '1d': 'daily'
      };
      
      const interval = intervalMap[timeframe] || '15min';
      
      const response = await axios.get(this.alphaVantageBaseUrl, {
        params: {
          function: 'FX_INTRADAY',
          from_symbol: pair.split('/')[0],
          to_symbol: pair.split('/')[1],
          interval: interval,
          apikey: this.alphaVantageApiKey
        }
      });

      if (response.data && response.data['Time Series FX (5min)']) {
        const timeSeries = response.data['Time Series FX (5min)'];
        const timestamps = Object.keys(timeSeries).sort().reverse();
        const latestData = timeSeries[timestamps[0]];
        const price = parseFloat(latestData['4. close']);
        
        return {
          price,
          timeSeries,
          interval,
          timestamp: new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching Forex price for ${pair}:`, error);
      return null;
    }
  }

  // Calculate technical indicators for specific timeframe
  async calculateTechnicalIndicators(pair, type, timeframe = '15m') {
    try {
      let priceData;
      
      if (type === 'crypto') {
        const symbol = pair.replace('/', '');
        priceData = await this.getBinancePrice(symbol, timeframe);
      } else {
        priceData = await this.getForexPrice(pair, timeframe);
      }
      
      if (!priceData) {
        return {
          ema: 'neutral',
          rsi: 'neutral',
          macd: 'neutral'
        };
      }

      // Calculate EMA (20 vs 50)
      const ema20 = this.calculateEMA(priceData.klines || priceData.timeSeries, 20);
      const ema50 = this.calculateEMA(priceData.klines || priceData.timeSeries, 50);
      
      let emaSignal = 'neutral';
      if (ema20 > ema50) {
        emaSignal = 'bullish';
      } else if (ema20 < ema50) {
        emaSignal = 'bearish';
      }

      // Calculate RSI
      const rsi = this.calculateRSI(priceData.klines || priceData.timeSeries);
      let rsiSignal = 'neutral';
      if (rsi < 30) {
        rsiSignal = 'oversold';
      } else if (rsi > 70) {
        rsiSignal = 'overbought';
      }

      // Calculate MACD
      const macd = this.calculateMACD(priceData.klines || priceData.timeSeries);
      let macdSignal = 'neutral';
      if (macd > 0) {
        macdSignal = 'bullish';
      } else if (macd < 0) {
        macdSignal = 'bearish';
      }

      return {
        ema: emaSignal,
        rsi: rsiSignal,
        macd: macdSignal
      };
    } catch (error) {
      console.error(`❌ Error calculating indicators for ${pair}:`, error);
      return {
        ema: 'neutral',
        rsi: 'neutral',
        macd: 'neutral'
      };
    }
  }

  // Determine market trend based on indicators and price data
  determineMarketTrend(indicators, priceData) {
    let bullishCount = 0;
    let bearishCount = 0;
    
    if (indicators.ema === 'bullish') bullishCount++;
    if (indicators.ema === 'bearish') bearishCount++;
    if (indicators.macd === 'bullish') bullishCount++;
    if (indicators.macd === 'bearish') bearishCount++;
    
    let trend = 'unknown';
    let strength = 0;
    
    if (bullishCount > bearishCount) {
      trend = 'bullish';
      strength = (bullishCount / 2) * 100;
    } else if (bearishCount > bullishCount) {
      trend = 'bearish';
      strength = (bearishCount / 2) * 100;
    } else {
      trend = 'sideways';
      strength = 50;
    }
    
    return {
      currentTrend: trend,
      trendStrength: strength,
      lastUpdated: new Date()
    };
  }

  // Calculate EMA
  calculateEMA(data, period) {
    if (!data || data.length < period) return 0;
    
    const prices = data.map(d => parseFloat(d[4] || d['4. close']));
    const multiplier = 2 / (period + 1);
    
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // Calculate RSI
  calculateRSI(data, period = 14) {
    if (!data || data.length < period + 1) return 50;
    
    const prices = data.map(d => parseFloat(d[4] || d['4. close']));
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < period + 1; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  }

  // Calculate MACD
  calculateMACD(data) {
    if (!data || data.length < 26) return 0;
    
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    return ema12 - ema26;
  }

  // Determine recommendation based on indicators
  determineRecommendation(indicators) {
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    if (indicators.ema === 'bullish') bullishSignals++;
    if (indicators.ema === 'bearish') bearishSignals++;
    if (indicators.rsi === 'oversold') bullishSignals++;
    if (indicators.rsi === 'overbought') bearishSignals++;
    if (indicators.macd === 'bullish') bullishSignals++;
    if (indicators.macd === 'bearish') bearishSignals++;
    
    // Require at least 2 indicators to align for a signal
    if (bullishSignals >= 2) {
      return 'BUY';
    } else if (bearishSignals >= 2) {
      return 'SELL';
    }
    
    return 'HOLD';
  }

  // Calculate confidence based on indicator alignment
  calculateConfidence(indicators) {
    let confidence = 50; // Base confidence
    
    // Add confidence for each bullish/bearish indicator
    if (indicators.ema !== 'neutral') confidence += 15;
    if (indicators.rsi !== 'neutral') confidence += 15;
    if (indicators.macd !== 'neutral') confidence += 20;
    
    // Bonus for strong alignment
    const bullishCount = [indicators.ema, indicators.rsi, indicators.macd]
      .filter(ind => ind === 'bullish' || ind === 'bearish').length;
    
    if (bullishCount >= 3) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  // Calculate risk/reward ratio
  calculateRiskRewardRatio(currentPrice, stopLoss, takeProfit) {
    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(takeProfit - currentPrice);
    return reward / risk;
  }

  // Generate signal logic explanation
  generateSignalLogic(indicators, recommendation) {
    const reasons = [];
    
    if (indicators.ema !== 'neutral') {
      reasons.push(`EMA: ${indicators.ema} trend`);
    }
    if (indicators.rsi !== 'neutral') {
      reasons.push(`RSI: ${indicators.rsi} condition`);
    }
    if (indicators.macd !== 'neutral') {
      reasons.push(`MACD: ${indicators.macd} momentum`);
    }
    
    return `${recommendation} signal based on: ${reasons.join(', ')}`;
  }

  // Update existing signals with new market data
  async updateExistingSignals() {
    try {
      const activeSignals = await Signal.find({ status: 'active' });
      
      for (const signal of activeSignals) {
        try {
          let currentPrice;
          let currentTrend;
          
          if (signal.type === 'crypto') {
            const symbol = signal.pair.replace('/', '');
            const priceData = await this.getBinancePrice(symbol, signal.timeframe);
            if (priceData) {
              currentPrice = priceData.price;
              const indicators = await this.calculateTechnicalIndicators(signal.pair, signal.type, signal.timeframe);
              currentTrend = this.determineMarketTrend(indicators, priceData).currentTrend;
            }
          } else {
            const priceData = await this.getForexPrice(signal.pair, signal.timeframe);
            if (priceData) {
              currentPrice = priceData.price;
              const indicators = await this.calculateTechnicalIndicators(signal.pair, signal.type, signal.timeframe);
              currentTrend = this.determineMarketTrend(indicators, priceData).currentTrend;
            }
          }
          
          if (currentPrice && currentTrend) {
            const oldStatus = signal.status;
            const newStatus = signal.updateStatus(currentPrice, currentTrend);
            
            if (oldStatus !== newStatus) {
              await signal.save();
              console.log(`✅ Signal ${signal._id} status updated: ${oldStatus} → ${newStatus}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error updating signal ${signal._id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error updating existing signals:', error);
    }
  }
}

module.exports = TradingSignalsService;
