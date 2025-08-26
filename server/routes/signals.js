const express = require('express');
const Signal = require('../models/Signal');

const router = express.Router();

// Get all active signals
router.get('/active', async (req, res) => {
  try {
    const signals = await Signal.find({ status: 'active' })
      .populate('generatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ signals });
  } catch (error) {
    console.error('❌ Error fetching active signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all signals with filters
router.get('/', async (req, res) => {
  try {
    const { 
      pair, 
      type, 
      status, 
      recommendation,
      dateFrom, 
      dateTo,
      limit = 50,
      page = 1
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
    
    const signals = await Signal.find(query)
      .populate('generatedBy', 'username')
      .sort({ createdAt: -1 })
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
    console.error('❌ Error fetching signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get signal by ID
router.get('/:id', async (req, res) => {
  try {
    const signal = await Signal.findById(req.params.id)
      .populate('generatedBy', 'username');

    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    res.json({ signal });
  } catch (error) {
    console.error('❌ Error fetching signal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new signal
router.post('/', async (req, res) => {
  try {
    const signalData = req.body;
    
    // Set default values
    signalData.generatedBy = req.body.generatedBy || '507f1f77bcf86cd799439011'; // Mock user ID
    signalData.status = 'active';
    
    const signal = new Signal(signalData);
    await signal.save();

    res.status(201).json({ 
      message: 'Signal created successfully',
      signal 
    });
  } catch (error) {
    console.error('❌ Error creating signal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update signal
router.put('/:id', async (req, res) => {
  try {
    const signal = await Signal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('generatedBy', 'username');

    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    res.json({ 
      message: 'Signal updated successfully',
      signal 
    });
  } catch (error) {
    console.error('❌ Error updating signal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete signal
router.delete('/:id', async (req, res) => {
  try {
    const signal = await Signal.findByIdAndDelete(req.params.id);

    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    res.json({ message: 'Signal deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting signal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get signal statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Signal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          hitSl: { $sum: { $cond: [{ $eq: ['$status', 'hit_sl'] }, 1, 0] } },
          hitTp1: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp1'] }, 1, 0] } },
          hitTp2: { $sum: { $cond: [{ $eq: ['$status', 'hit_tp2'] }, 1, 0] } },
          buySignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'BUY'] }, 1, 0] } },
          sellSignals: { $sum: { $cond: [{ $eq: ['$recommendation', 'SELL'] }, 1, 0] } },
          cryptoSignals: { $sum: { $cond: [{ $eq: ['$type', 'crypto'] }, 1, 0] } },
          forexSignals: { $sum: { $cond: [{ $eq: ['$type', 'forex'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      hitSl: 0,
      hitTp1: 0,
      hitTp2: 0,
      buySignals: 0,
      sellSignals: 0,
      cryptoSignals: 0,
      forexSignals: 0
    };

    // Calculate success rate
    const totalClosed = result.hitSl + result.hitTp1 + result.hitTp2;
    const successRate = totalClosed > 0 ? 
      ((result.hitTp1 + result.hitTp2) / totalClosed * 100).toFixed(2) : 0;

    res.json({
      ...result,
      successRate: parseFloat(successRate)
    });
  } catch (error) {
    console.error('❌ Error fetching signal stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get signals by pair
router.get('/pair/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const { limit = 20 } = req.query;

    const signals = await Signal.find({ pair })
      .populate('generatedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ signals });
  } catch (error) {
    console.error('❌ Error fetching signals by pair:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get signals by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    const signals = await Signal.find({ type })
      .populate('generatedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ signals });
  } catch (error) {
    console.error('❌ Error fetching signals by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
