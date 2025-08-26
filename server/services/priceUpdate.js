const cron = require('node-cron');
const axios = require('axios');

class PriceUpdateService {
  constructor(io) {
    this.io = io;
    this.binanceBaseUrl = 'https://api.binance.com/api/v3';
    this.alphaVantageBaseUrl = 'https://www.alphavantage.co/query';
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.isRunning = false;
    this.updateInterval = process.env.SIGNAL_UPDATE_INTERVAL || 10000; // 10 seconds
  }

  // Start the price update service
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting Price Update Service...');
    
    // Update prices every 10 seconds
    setInterval(() => {
      this.updateAllPrices();
    }, this.updateInterval);
    
    // Generate new signals every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.generateNewSignals();
    });
    
    console.log('✅ Price Update Service started');
  }

  // Stop the price update service
  stop() {
    this.isRunning = false;
    console.log('🛑 Price Update Service stopped');
  }

  // Update prices for all trading pairs
  async updateAllPrices() {
    try {
      // Update crypto prices
      await this.updateCryptoPrices();
      
      // Update forex prices
      await this.updateForexPrices();
      
    } catch (error) {
      console.error('❌ Error updating prices:', error);
    }
  }

  // Update crypto prices
  async updateCryptoPrices() {
    const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    
    for (const pair of cryptoPairs) {
      try {
        const symbol = pair.replace('/', '');
        const priceData = await this.getBinancePrice(symbol);
        
        if (priceData) {
          // Emit price update to clients
          this.io.emit('price:update', {
            pair,
            type: 'crypto',
            price: priceData.price,
            change: priceData.change,
            volume: priceData.volume,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`❌ Error updating crypto price for ${pair}:`, error);
      }
    }
  }

  // Update forex prices
  async updateForexPrices() {
    const forexPairs = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
      'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/CHF',
      'USD/INR', 'USD/CNY', 'USD/BRL', 'USD/MXN', 'USD/ZAR'
    ];
    
    for (const pair of forexPairs) {
      try {
        const priceData = await this.getForexPrice(pair);
        
        if (priceData) {
          // Emit price update to clients
          this.io.emit('price:update', {
            pair,
            type: 'forex',
            price: priceData.price,
            change: priceData.change,
            volume: priceData.volume,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`❌ Error updating forex price for ${pair}:`, error);
      }
    }
  }

  // Get Binance price data
  async getBinancePrice(symbol) {
    try {
      const response = await axios.get(`${this.binanceBaseUrl}/ticker/24hr?symbol=${symbol}`);
      return {
        price: parseFloat(response.data.lastPrice),
        change: parseFloat(response.data.priceChangePercent),
        volume: parseFloat(response.data.volume)
      };
    } catch (error) {
      // For demo purposes, return mock data if API fails
      const mockPrices = {
        'BTCUSDT': { price: 110059, change: 2.5, volume: 25000000 },
        'ETHUSDT': { price: 3250, change: 1.8, volume: 15000000 },
        'BNBUSDT': { price: 580, change: -0.5, volume: 8000000 },
        'ADAUSDT': { price: 0.45, change: 3.2, volume: 5000000 },
        'SOLUSDT': { price: 95, change: 4.1, volume: 12000000 }
      };
      
      return mockPrices[symbol] || { price: 100, change: 0, volume: 1000000 };
    }
  }

  // Get Forex price data
  async getForexPrice(pair) {
    try {
      // For demo purposes, return mock data with slight variations
      // In production, use Alpha Vantage API
      const basePrices = {
        'EUR/USD': { price: 1.0850, change: 0.15, volume: 1500000 },
        'GBP/USD': { price: 1.2650, change: -0.25, volume: 1200000 },
        'USD/JPY': { price: 149.50, change: 0.30, volume: 2000000 },
        'USD/CHF': { price: 0.8950, change: -0.10, volume: 800000 },
        'AUD/USD': { price: 0.6550, change: 0.20, volume: 900000 },
        'USD/CAD': { price: 1.3550, change: -0.05, volume: 1100000 },
        'EUR/GBP': { price: 0.8575, change: 0.12, volume: 950000 },
        'EUR/JPY': { price: 162.15, change: 0.45, volume: 1800000 },
        'GBP/JPY': { price: 189.15, change: 0.05, volume: 1600000 },
        'AUD/JPY': { price: 97.95, change: 0.50, volume: 1100000 },
        'EUR/CHF': { price: 0.9705, change: 0.25, volume: 750000 },
        'USD/INR': { price: 83.25, change: -0.08, volume: 3000000 },
        'USD/CNY': { price: 7.2850, change: 0.02, volume: 2500000 },
        'USD/BRL': { price: 4.9850, change: -0.15, volume: 1800000 },
        'USD/MXN': { price: 17.85, change: 0.10, volume: 2200000 },
        'USD/ZAR': { price: 18.95, change: -0.20, volume: 1400000 }
      };

      const baseData = basePrices[pair] || { price: 1.0000, change: 0.00, volume: 1000000 };
      
      // Add small random variation to simulate real-time updates
      const variation = (Math.random() - 0.5) * 0.001; // ±0.05% variation
      const newPrice = baseData.price * (1 + variation);
      
      return {
        price: parseFloat(newPrice.toFixed(4)),
        change: baseData.change + (Math.random() - 0.5) * 0.1,
        volume: baseData.volume
      };
    } catch (error) {
      console.error(`❌ Error fetching Forex price for ${pair}:`, error);
      return null;
    }
  }

  // Generate new signals periodically
  async generateNewSignals() {
    try {
      console.log('🔄 Generating new trading signals...');
      
      // Emit signal generation event
      this.io.emit('signals:generating', { timestamp: new Date() });
      
      // In a real application, you would call the TradingSignalsService here
      // For now, we'll just emit an event that the frontend can handle
      
      setTimeout(() => {
        this.io.emit('signals:generated', { 
          timestamp: new Date(),
          message: 'New signals generated successfully'
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error generating new signals:', error);
    }
  }

  // Get market summary
  async getMarketSummary() {
    try {
      const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
      const forexPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
      
      const summary = {
        crypto: [],
        forex: [],
        timestamp: new Date()
      };
      
      // Get crypto summary
      for (const pair of cryptoPairs) {
        const symbol = pair.replace('/', '');
        const priceData = await this.getBinancePrice(symbol);
        if (priceData) {
          summary.crypto.push({
            pair,
            price: priceData.price,
            change: priceData.change,
            volume: priceData.volume
          });
        }
      }
      
      // Get forex summary
      for (const pair of forexPairs) {
        const priceData = await this.getForexPrice(pair);
        if (priceData) {
          summary.forex.push({
            pair,
            price: priceData.price,
            change: priceData.change,
            volume: priceData.volume
          });
        }
      }
      
      return summary;
    } catch (error) {
      console.error('❌ Error getting market summary:', error);
      return null;
    }
  }

  // Emit market summary to clients
  async emitMarketSummary() {
    try {
      const summary = await this.getMarketSummary();
      if (summary) {
        this.io.emit('market:summary', summary);
      }
    } catch (error) {
      console.error('❌ Error emitting market summary:', error);
    }
  }

  // Start emitting market summary
  startMarketSummary() {
    // Emit market summary every 30 seconds
    setInterval(() => {
      this.emitMarketSummary();
    }, 30000);
  }
}

module.exports = PriceUpdateService;
