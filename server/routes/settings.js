const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    // In a real app, you'd verify the JWT token and get the actual user
    // For demo purposes, we'll return mock preferences
    const mockPreferences = {
      stopLossPercent: 1.5,
      takeProfit1Percent: 2.0,
      takeProfit2Percent: 5.0,
      notificationSound: true,
      theme: 'light'
    };

    res.json({ preferences: mockPreferences });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate preferences
    const validationErrors = [];

    if (preferences.stopLossPercent !== undefined) {
      if (preferences.stopLossPercent < 0.5 || preferences.stopLossPercent > 10) {
        validationErrors.push('Stop loss must be between 0.5% and 10%');
      }
    }

    if (preferences.takeProfit1Percent !== undefined) {
      if (preferences.takeProfit1Percent < 1.0 || preferences.takeProfit1Percent > 20) {
        validationErrors.push('Take profit 1 must be between 1.0% and 20%');
      }
    }

    if (preferences.takeProfit2Percent !== undefined) {
      if (preferences.takeProfit2Percent < 2.0 || preferences.takeProfit2Percent > 50) {
        validationErrors.push('Take profit 2 must be between 2.0% and 50%');
      }
    }

    if (preferences.theme !== undefined && !['light', 'dark'].includes(preferences.theme)) {
      validationErrors.push('Theme must be either "light" or "dark"');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // In a real app, you'd update the actual user in the database
    // For demo purposes, we'll just return success
    res.json({ 
      message: 'Preferences updated successfully',
      preferences: {
        stopLossPercent: preferences.stopLossPercent || 1.5,
        takeProfit1Percent: preferences.takeProfit1Percent || 2.0,
        takeProfit2Percent: preferences.takeProfit2Percent || 5.0,
        notificationSound: preferences.notificationSound !== undefined ? preferences.notificationSound : true,
        theme: preferences.theme || 'light'
      }
    });
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification settings
router.get('/notifications', async (req, res) => {
  try {
    // Mock notification settings
    const notificationSettings = {
      email: {
        enabled: true,
        stopLoss: true,
        takeProfit: true,
        newSignals: false
      },
      push: {
        enabled: true,
        stopLoss: true,
        takeProfit: true,
        newSignals: true
      },
      sound: {
        enabled: true,
        stopLoss: true,
        takeProfit: true,
        newSignals: false
      }
    };

    res.json({ notificationSettings });
  } catch (error) {
    console.error('❌ Error fetching notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification settings
router.put('/notifications', async (req, res) => {
  try {
    const { notificationSettings } = req.body;

    // Validate notification settings
    if (notificationSettings && typeof notificationSettings === 'object') {
      // In a real app, you'd validate and save these settings
      res.json({ 
        message: 'Notification settings updated successfully',
        notificationSettings
      });
    } else {
      res.status(400).json({ error: 'Invalid notification settings' });
    }
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trading settings
router.get('/trading', async (req, res) => {
  try {
    // Mock trading settings
    const tradingSettings = {
      defaultStopLoss: 1.5,
      defaultTakeProfit1: 2.0,
      defaultTakeProfit2: 5.0,
      riskManagement: {
        maxRiskPerTrade: 2.0,
        maxDailyLoss: 5.0,
        maxOpenTrades: 10
      },
      autoTrading: {
        enabled: false,
        maxSignalsPerDay: 5,
        minConfidence: 70
      }
    };

    res.json({ tradingSettings });
  } catch (error) {
    console.error('❌ Error fetching trading settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update trading settings
router.put('/trading', async (req, res) => {
  try {
    const { tradingSettings } = req.body;

    // Validate trading settings
    const validationErrors = [];

    if (tradingSettings.defaultStopLoss !== undefined) {
      if (tradingSettings.defaultStopLoss < 0.5 || tradingSettings.defaultStopLoss > 10) {
        validationErrors.push('Default stop loss must be between 0.5% and 10%');
      }
    }

    if (tradingSettings.defaultTakeProfit1 !== undefined) {
      if (tradingSettings.defaultTakeProfit1 < 1.0 || tradingSettings.defaultTakeProfit1 > 20) {
        validationErrors.push('Default take profit 1 must be between 1.0% and 20%');
      }
    }

    if (tradingSettings.defaultTakeProfit2 !== undefined) {
      if (tradingSettings.defaultTakeProfit2 < 2.0 || tradingSettings.defaultTakeProfit2 > 50) {
        validationErrors.push('Default take profit 2 must be between 2.0% and 50%');
      }
    }

    if (tradingSettings.riskManagement) {
      if (tradingSettings.riskManagement.maxRiskPerTrade < 0.1 || tradingSettings.riskManagement.maxRiskPerTrade > 10) {
        validationErrors.push('Max risk per trade must be between 0.1% and 10%');
      }
      if (tradingSettings.riskManagement.maxDailyLoss < 1.0 || tradingSettings.riskManagement.maxDailyLoss > 20) {
        validationErrors.push('Max daily loss must be between 1.0% and 20%');
      }
      if (tradingSettings.riskManagement.maxOpenTrades < 1 || tradingSettings.riskManagement.maxOpenTrades > 50) {
        validationErrors.push('Max open trades must be between 1 and 50');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    res.json({ 
      message: 'Trading settings updated successfully',
      tradingSettings
    });
  } catch (error) {
    console.error('❌ Error updating trading settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system information
router.get('/system', async (req, res) => {
  try {
    const systemInfo = {
      version: '1.0.0',
      lastUpdate: new Date().toISOString(),
      features: {
        realTimeSignals: true,
        cryptoSignals: true,
        forexSignals: true,
        technicalAnalysis: true,
        alerts: true,
        charts: true,
        mobileResponsive: true,
        darkMode: true
      },
      apiStatus: {
        binance: 'connected',
        alphaVantage: 'connected',
        websocket: 'active'
      }
    };

    res.json({ systemInfo });
  } catch (error) {
    console.error('❌ Error fetching system info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export user data
router.get('/export', async (req, res) => {
  try {
    // In a real app, you'd export the user's actual data
    // For demo purposes, we'll return a mock export
    const exportData = {
      user: {
        username: 'Trader',
        email: 'trader@example.com',
        preferences: {
          stopLossPercent: 1.5,
          takeProfit1Percent: 2.0,
          takeProfit2Percent: 5.0,
          notificationSound: true,
          theme: 'light'
        }
      },
      signals: [],
      performance: {
        totalSignals: 0,
        successRate: 0,
        totalProfitLoss: 0
      },
      exportDate: new Date().toISOString()
    };

    res.json({ 
      message: 'Data export successful',
      exportData
    });
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
