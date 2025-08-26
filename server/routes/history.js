const express = require('express');
const Signal = require('../models/Signal');

const router = express.Router();

// Get signal history with filters
router.get('/', async (req, res) => {
  try {
    const { 
      pair, 
      type, 
      status, 
      recommendation,
      dateFrom, 
      dateTo,
      limit = 100,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (pair) query.pair = pair;
    if (type) query.type = type;
    if (status) query.status = status;
    if (recommendation) query.recommendation = recommendation;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const signals = await Signal.find(query)
      .populate('generatedBy', 'username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Signal.countDocuments(query);

    res.json({
      signals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching signal history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get performance summary
router.get('/performance', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const query = {};
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const performance = await Signal.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSignals: { $sum: 1 },
          activeSignals: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closedSignals: { $sum: { $cond: [{ $ne: ['$status', 'active'] }, 1, 0] } },
          hitStopLoss: { $sum: { $cond: [{ $eq: ['$status', 'hit_sl'] }, 1, 0] } },
          hitTakeProfit1: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp1'] }, 1, 0] } },
          hitTakeProfit2: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp2'] }, 1, 0] } },
          buySignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'BUY'] }, 1, 0] } },
          sellSignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'SELL'] }, 1, 0] } },
          cryptoSignals: { $sum: { $cond: [{ $eq: ['$type', 'crypto'] }, 1, 0] } },
          forexSignals: { $sum: { $cond: [{ $eq: ['$type', 'forex'] }, 1, 0] } },
          totalProfitLoss: { $sum: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', 0] } },
          avgProfitLoss: { $avg: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', null] } }
        }
      }
    ]);

    const result = performance[0] || {
      totalSignals: 0,
      activeSignals: 0,
      closedSignals: 0,
      hitStopLoss: 0,
      hitTakeProfit1: 0,
      hitTakeProfit2: 0,
      buySignals: 0,
      sellSignals: 0,
      cryptoSignals: 0,
      forexSignals: 0,
      totalProfitLoss: 0,
      avgProfitLoss: 0
    };

    // Calculate success rate
    const totalClosed = result.hitStopLoss + result.hitTakeProfit1 + result.hitTakeProfit2;
    const successRate = totalClosed > 0 ? 
      ((result.hitTakeProfit1 + result.hitTakeProfit2) / totalClosed * 100).toFixed(2) : 0;

    // Calculate win rate
    const winningSignals = result.hitTakeProfit1 + result.hitTakeProfit2;
    const winRate = totalClosed > 0 ? 
      (winningSignals / totalClosed * 100).toFixed(2) : 0;

    res.json({
      ...result,
      successRate: parseFloat(successRate),
      winRate: parseFloat(winRate),
      totalClosed,
      winningSignals
    });
  } catch (error) {
    console.error('❌ Error fetching performance summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get performance by pair
router.get('/performance/pair/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    const query = { pair };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const performance = await Signal.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$pair',
          totalSignals: { $sum: 1 },
          activeSignals: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closedSignals: { $sum: { $cond: [{ $ne: ['$status', 'active'] }, 1, 0] } },
          hitStopLoss: { $sum: { $cond: [{ $eq: ['$status', 'hit_sl'] }, 1, 0] } },
          hitTakeProfit1: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp1'] }, 1, 0] } },
          hitTakeProfit2: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp2'] }, 1, 0] } },
          buySignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'BUY'] }, 1, 0] } },
          sellSignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'SELL'] }, 1, 0] } },
          totalProfitLoss: { $sum: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', 0] } },
          avgProfitLoss: { $avg: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', null] } }
        }
      }
    ]);

    const result = performance[0] || {
      _id: pair,
      totalSignals: 0,
      activeSignals: 0,
      closedSignals: 0,
      hitStopLoss: 0,
      hitTakeProfit1: 0,
      hitTakeProfit2: 0,
      buySignals: 0,
      sellSignals: 0,
      totalProfitLoss: 0,
      avgProfitLoss: 0
    };

    // Calculate success rate
    const totalClosed = result.hitStopLoss + result.hitTakeProfit1 + result.hitTakeProfit2;
    const successRate = totalClosed > 0 ? 
      ((result.hitTakeProfit1 + result.hitTakeProfit2) / totalClosed * 100).toFixed(2) : 0;

    res.json({
      ...result,
      successRate: parseFloat(successRate),
      totalClosed
    });
  } catch (error) {
    console.error('❌ Error fetching pair performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get performance by type (crypto/forex)
router.get('/performance/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    const query = { type };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const performance = await Signal.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          totalSignals: { $sum: 1 },
          activeSignals: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closedSignals: { $sum: { $cond: [{ $ne: ['$status', 'active'] }, 1, 0] } },
          hitStopLoss: { $sum: { $cond: [{ $eq: ['$status', 'hit_sl'] }, 1, 0] } },
          hitTakeProfit1: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp1'] }, 1, 0] } },
          hitTakeProfit2: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp2'] }, 1, 0] } },
          buySignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'BUY'] }, 1, 0] } },
          sellSignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'SELL'] }, 1, 0] } },
          totalProfitLoss: { $sum: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', 0] } },
          avgProfitLoss: { $avg: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', null] } }
        }
      }
    ]);

    const result = performance[0] || {
      _id: type,
      totalSignals: 0,
      activeSignals: 0,
      closedSignals: 0,
      hitStopLoss: 0,
      hitTakeProfit1: 0,
      hitTakeProfit2: 0,
      buySignals: 0,
      sellSignals: 0,
      totalProfitLoss: 0,
      avgProfitLoss: 0
    };

    // Calculate success rate
    const totalClosed = result.hitStopLoss + result.hitTakeProfit1 + result.hitTakeProfit2;
    const successRate = totalClosed > 0 ? 
      ((result.hitTakeProfit1 + result.hitTakeProfit2) / totalClosed * 100).toFixed(2) : 0;

    res.json({
      ...result,
      successRate: parseFloat(successRate),
      totalClosed
    });
  } catch (error) {
    console.error('❌ Error fetching type performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly performance
router.get('/performance/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const monthlyPerformance = await Signal.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSignals: { $sum: 1 },
          closedSignals: { $sum: { $cond: [{ $ne: ['$status', 'active'] }, 1, 0] } },
          hitStopLoss: { $sum: { $cond: [{ $eq: ['$status', 'hit_sl'] }, 1, 0] } },
          hitTakeProfit1: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp1'] }, 1, 0] } },
          hitTakeProfit2: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp2'] }, 1, 0] } },
          totalProfitLoss: { $sum: { $cond: [{ $ne: ['$outcome.profitLoss', null] }, '$outcome.profitLoss', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing months with zero values
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const filledPerformance = monthNames.map((month, index) => {
      const monthData = monthlyPerformance.find(m => m._id === index + 1);
      return monthData || {
        _id: index + 1,
        month: month,
        totalSignals: 0,
        closedSignals: 0,
        hitStopLoss: 0,
        hitTakeProfit1: 0,
        hitTakeProfit2: 0,
        totalProfitLoss: 0
      };
    });

    res.json({
      year: currentYear,
      monthlyPerformance: filledPerformance
    });
  } catch (error) {
    console.error('❌ Error fetching monthly performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
