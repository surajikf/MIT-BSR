# 🚀 Trading Signals Pro

A full-stack web application that provides real-time Buy/Sell trading suggestions for BTC/USDT and major Forex pairs. Built with React, Node.js, and MongoDB, featuring a professional Jira/Notion-style interface.

![Trading Signals Pro](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5+-orange)

## ✨ Features

### 📊 Real-Time Trading Signals
- **Live Price Feeds**: BTC/USDT from Binance API, Forex pairs from Alpha Vantage
- **Smart Signal Generation**: Based on technical indicators (EMA, RSI, MACD)
- **Risk Management**: Automatic stop-loss and take-profit calculations
- **Signal Confidence**: Percentage-based confidence scoring

### 💰 Supported Markets
- **Cryptocurrency**: BTC/USDT, ETH/USDT, BNB/USDT, ADA/USDT, SOL/USDT
- **Forex Pairs**: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD
- **Cross Pairs**: EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY, EUR/CHF
- **Commodity Pairs**: USD/INR, USD/CNY, USD/BRL, USD/MXN, USD/ZAR

### 🎯 Technical Analysis
- **EMA Crossover**: 20 vs 50 period analysis
- **RSI Indicators**: Oversold/Overbought conditions
- **MACD Signals**: Bullish/Bearish crossovers
- **Multi-Indicator Alignment**: Requires 2+ indicators for signal generation

### 🔔 Smart Alerts & Notifications
- **Stop-Loss Alerts**: Real-time notifications when price hits stop-loss
- **Take-Profit Alerts**: Notifications for TP1 and TP2 targets
- **Sound Alerts**: Configurable audio notifications
- **Push Notifications**: Browser-based push alerts

### 📈 Professional Dashboard
- **Market Overview**: Live crypto and forex price updates
- **Signal Summary**: Active signals with performance metrics
- **Performance Tracking**: Success rate, profit/loss analysis
- **Interactive Charts**: TradingView integration with technical indicators

### 🎨 Modern UI/UX
- **Jira/Notion Style**: Clean, professional interface design
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-Time Updates**: WebSocket-powered live data synchronization

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Socket.IO Client**: Real-time WebSocket communication
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Token authentication

### APIs & Services
- **Binance API**: Cryptocurrency price data
- **Alpha Vantage API**: Forex market data
- **TradingView Widget**: Professional charting solution
- **Node-Cron**: Scheduled tasks and signal generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trading-signals-pro.git
   cd trading-signals-pro
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Access
- **Username**: demo
- **Password**: demo123

## 📁 Project Structure

```
trading-signals-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── index.js           # Server entry point
├── package.json           # Backend dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/trading-signals

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# API Keys
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# Trading Configuration
DEFAULT_STOP_LOSS_PERCENT=1.5
DEFAULT_TAKE_PROFIT_1_PERCENT=2.0
DEFAULT_TAKE_PROFIT_2_PERCENT=5.0
SIGNAL_UPDATE_INTERVAL=10000
```

### API Keys Setup

1. **Binance API**: Create account at [Binance](https://binance.com) and generate API keys
2. **Alpha Vantage**: Get free API key from [Alpha Vantage](https://alphavantage.co)

## 📊 Signal Generation Logic

### Technical Indicators

1. **EMA (Exponential Moving Average)**
   - 20-period vs 50-period crossover
   - Bullish: 20 EMA > 50 EMA
   - Bearish: 20 EMA < 50 EMA

2. **RSI (Relative Strength Index)**
   - Oversold: RSI < 30 (Bullish signal)
   - Overbought: RSI > 70 (Bearish signal)
   - Neutral: 30 ≤ RSI ≤ 70

3. **MACD (Moving Average Convergence Divergence)**
   - Bullish: MACD line > Signal line
   - Bearish: MACD line < Signal line

### Signal Generation Rules

- **BUY Signal**: 2+ bullish indicators
- **SELL Signal**: 2+ bearish indicators
- **HOLD**: Insufficient indicator alignment

### Risk Management

- **Stop Loss**: Default 1.5% below entry price
- **Take Profit 1**: Default 2.0% above entry price
- **Take Profit 2**: Default 5.0% above entry price
- **Risk/Reward Ratio**: Calculated automatically

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/preferences` - Update preferences

### Trading Signals
- `GET /api/signals` - Get all signals with filters
- `GET /api/signals/active` - Get active signals
- `GET /api/signals/:id` - Get signal by ID
- `POST /api/signals` - Create new signal
- `PUT /api/signals/:id` - Update signal
- `DELETE /api/signals/:id` - Delete signal

### History & Performance
- `GET /api/history` - Get signal history
- `GET /api/history/performance` - Get performance summary
- `GET /api/history/performance/pair/:pair` - Get pair performance
- `GET /api/history/performance/type/:type` - Get type performance

### Settings
- `GET /api/settings/preferences` - Get user preferences
- `PUT /api/settings/preferences` - Update preferences
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings

## 🎨 Customization

### Theme Customization
```css
/* Custom color variables in tailwind.config.js */
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e'
  },
  crypto: {
    light: '#f0f9ff',
    DEFAULT: '#0ea5e9',
    dark: '#0369a1'
  }
}
```

### Signal Parameters
```javascript
// Adjust default values in .env
DEFAULT_STOP_LOSS_PERCENT=1.5
DEFAULT_TAKE_PROFIT_1_PERCENT=2.0
DEFAULT_TAKE_PROFIT_2_PERCENT=5.0
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production MongoDB connection
- Set secure JWT secret
- Configure API rate limits

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach
- **Touch Optimized**: Touch-friendly interface elements
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Basic offline functionality

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing security
- **Rate Limiting**: API request rate limiting

## 📈 Performance Optimization

- **WebSocket**: Real-time data updates
- **MongoDB Indexing**: Optimized database queries
- **React Optimization**: Memoization and lazy loading
- **CDN Integration**: Static asset optimization
- **Caching**: Redis integration ready

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test
```

### Backend Testing
```bash
npm run test:server
```

### API Testing
```bash
# Using curl
curl -X GET http://localhost:5000/api/signals/active

# Using Postman
# Import the provided Postman collection
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Ensure MongoDB is running
   sudo systemctl start mongod
   ```

2. **API Key Errors**
   ```bash
   # Check .env file configuration
   # Verify API key validity
   ```

3. **Port Conflicts**
   ```bash
   # Change ports in .env file
   PORT=5001
   ```

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TradingView**: Professional charting widgets
- **Binance**: Cryptocurrency market data
- **Alpha Vantage**: Forex market data
- **Tailwind CSS**: Utility-first CSS framework
- **React Community**: Amazing open-source ecosystem

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/trading-signals-pro/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/trading-signals-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/trading-signals-pro/discussions)
- **Email**: support@tradingsignalspro.com

---

**Made with ❤️ by the Trading Signals Pro Team**

*Built for traders, by traders*
