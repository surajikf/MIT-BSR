const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const signalsRoutes = require('./routes/signals');
const historyRoutes = require('./routes/history');
const settingsRoutes = require('./routes/settings');

// Import services
const TradingSignalsService = require('./services/tradingSignals');
const PriceUpdateService = require('./services/priceUpdate');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-signals', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/signals', signalsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Handle signal requests
  socket.on('signals:request', async () => {
    try {
      // Generate new signals for demo user
      const demoUserId = 'demo-user-id'; // In production, get from auth
      const signals = await tradingSignalsService.generateAllSignals(demoUserId);
      socket.emit('signals:update', { type: 'signals:update', data: signals });
    } catch (error) {
      console.error('❌ Error handling signals request:', error);
    }
  });
});

// Initialize services
const tradingSignalsService = new TradingSignalsService(io);
const priceUpdateService = new PriceUpdateService(io);

// Start price update service
priceUpdateService.start();

// Schedule signal updates and market trend checks
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 Updating existing signals with market data...');
    await tradingSignalsService.updateExistingSignals();
    console.log('✅ Signal updates completed');
  } catch (error) {
    console.error('❌ Error updating signals:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

// Schedule new signal generation (every 15 minutes)
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('🔄 Generating new trading signals...');
    const demoUserId = 'demo-user-id'; // In production, get from auth
    await tradingSignalsService.generateAllSignals(demoUserId);
    console.log('✅ New signals generated');
  } catch (error) {
    console.error('❌ Error generating signals:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Trading Signals API ready`);
  console.log(`🔗 Frontend: http://localhost:3000`);
  console.log(`🔗 Backend: http://localhost:${PORT}`);
  console.log(`⏰ Signal updates scheduled every 5 minutes`);
  console.log(`⏰ New signal generation scheduled every 15 minutes`);
});
