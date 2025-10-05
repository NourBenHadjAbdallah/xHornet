# 🐝 xHornet - Crypto Trading Platform

A professional desktop cryptocurrency trading platform built with Electron, featuring automated sniper bot functionality, early listing detection, and real-time chat analysis.

![Platform](https://img.shields.io/badge/Platform-Desktop-blue)
![Electron](https://img.shields.io/badge/Electron-38.2.1-47848f)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Node](https://img.shields.io/badge/Node-%3E%3D20.0.0-green)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Technologies](#technologies)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**xHornet** is an advanced desktop cryptocurrency trading platform designed to help traders detect early cryptocurrency listings and execute trades faster than the competition. Built as an Electron application, it combines the power of React for the frontend, Express for the backend server, and Ethereum blockchain integration for seamless trading operations.

The platform includes real-time chat analysis from multiple sources (Telegram, Discord, X) and an automated sniper bot for instant trade execution.

## ✨ Features

### 🔐 Authentication System
- Secure login with username/password authentication
- Modern UI with password visibility toggle
- Error handling and validation
- Session management with persistent state

### 📊 Trading Dashboard
- **Real-time Statistics**
  - Total profit tracking with percentage display
  - Active trades counter
  - New listings detector with alerts
  - Success rate indicator

- **Sniper Bot Control Panel**
  - Live status monitoring with pulse animation
  - Start/Pause/Reset controls
  - Quick settings configuration
  - Gas price monitoring and adjustment
  - Automatic trade execution

- **Early Listing Detection**
  - Real-time new listing alerts
  - Price and market cap tracking
  - 1-hour price change monitoring
  - One-click sniper execution
  - Multi-chain support (BSC, ETH, etc.)

- **Multi-Platform Chat Analysis**
  - Telegram monitoring
  - Discord server tracking
  - X sentiment analysis
  - Real-time sentiment indicators (Bullish/Neutral/Bearish)
  - Hot mentions tracking
  - Alert notifications system

- **Activity Feed**
  - Recent trades with profit/loss percentage
  - System alerts and warnings
  - New listing notifications
  - Timestamped events log

### 🎨 Design Features
- Dark theme optimized for crypto trading
- Fully responsive interface
- Smooth animations and transitions
- Glass-morphism effects
- Color-coded status indicators
- Live pulse animations
- Professional trading UI/UX

### 🔗 Blockchain Integration
- Ethereum (ethers.js v6.15.0)
- Keccak256 hashing support
- Smart contract interaction
- Transaction monitoring

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### System Requirements
- **Windows**: Windows 10 or higher
- **macOS**: macOS 10.13 or higher
- **Linux**: Ubuntu 18.04 or higher

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/NourBenHadjAbdallah/xHornet.git
cd xHornet
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required dependencies including:
- Electron for desktop application
- React for UI
- Express for backend server
- Ethers.js for blockchain interaction
- Material-UI for components

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=your_private_key_here

# API Keys (if needed)
TELEGRAM_BOT_TOKEN=your_telegram_token
DISCORD_BOT_TOKEN=your_discord_token
TWITTER_API_KEY=your_twitter_key
```

### 4. Create Configuration File
Create `src/helpers/config.json`:
```json
{
  "USER_1": {
    "LOGIN": "admin",
    "PASSWORD": "password"
  }
}
```

## 🚀 Running the Application

### Development Mode
Start all services (React, Server, Electron) concurrently:
```bash
npm start
```

This command will:
1. Start the React development server on `http://localhost:3000`
2. Start the Express backend server
3. Launch the Electron desktop application
4. Enable hot-reloading for development

### Individual Services

**React Frontend Only:**
```bash
npm run react-start
```

**Backend Server Only:**
```bash
npm run server-start
```

**Electron Only:**
```bash
npm run electron-dev
```

## 📦 Building for Production

### Build All Components
```bash
npm run preelectron-pack
```

This will:
1. Build the React frontend (`react-build`)
2. Build the Express server (`server-build`)

### Create Desktop Application

**For Current Architecture:**
```bash
npm run electron-pack
```

**For 32-bit Architecture:**
```bash
npm run electron-pack-arch32
```

The built application will be available in the `dist` folder.

### Output Files
- **Windows**: `xHornet Setup.exe` (NSIS installer)
- **macOS**: `xHornet.dmg`
- **Linux**: `xHornet.AppImage`

## 📁 Project Structure

```
xHornet/
├── public/
│   ├── electron.js              # Electron main process
│   ├── splash-resources/        # Splash screen assets
│   └── index.html
├── src/
│   ├── Login/
│   │   ├── Login.js            # Login component
│   │   └── loginStyle.css      # Login styles
│   ├── Home/
│   │   ├── Home.js             # Main dashboard
│   │   └── homeStyle.css       # Dashboard styles
│   ├── helpers/
│   │   └── config.json         # User configuration
│   ├── resources/              # Images and assets
│   ├── App.js                  # Main React component
│   └── index.js                # React entry point
├── server/
│   └── server.js               # Express backend server
├── build/                      # React production build
├── build-server/               # Server production build
├── dist/                       # Electron packaged app
├── assets/                     # Build resources
├── scripts/
│   ├── dev.js                  # Development scripts
│   └── start.js
├── .env                        # Environment variables
├── package.json
├── babel.config.js
└── README.md
```

## ⚙️ Configuration

### Trading Bot Settings

Edit default values in `Home.js`:
```javascript
const botSettings = {
  tradeAmount: 0.1,        // Amount per trade (BNB/ETH)
  maxSlippage: 12,         // Maximum slippage (%)
  gasPrice: 5,             // Gas price (Gwei)
  autoSnipe: true,         // Enable auto-sniping
  minLiquidity: 10000      // Minimum liquidity ($)
};
```

### Blockchain Networks

Configure networks in your `.env` file or application settings:
```javascript
const networks = {
  bsc: {
    rpc: "https://bsc-dataseed.binance.org/",
    chainId: 56,
    name: "Binance Smart Chain"
  },
  ethereum: {
    rpc: "https://mainnet.infura.io/v3/YOUR_KEY",
    chainId: 1,
    name: "Ethereum Mainnet"
  }
};
```

### User Management

Add multiple users in `config.json`:
```json
{
  "USER_1": {
    "LOGIN": "admin",
    "PASSWORD": "secure_password_1"
  },
  "USER_2": {
    "LOGIN": "trader",
    "PASSWORD": "secure_password_2"
  }
}
```

## 🔧 Technologies

### Frontend
- **React**: 19.2.0 - UI framework
- **Material-UI**: 7.3.4 - Component library
- **Emotion**: CSS-in-JS styling
- **Recharts**: 3.2.1 - Data visualization
- **Lucide React**: 0.544.0 - Icon library
- **React Router**: 7.9.3 - Navigation

### Backend
- **Express**: 5.1.0 - Web server
- **CORS**: Cross-origin support
- **Nodemailer**: Email notifications
- **Dotenv**: Environment management

### Blockchain
- **Ethers.js**: 6.15.0 - Ethereum library
- **Keccak256**: Cryptographic hashing

### Desktop
- **Electron**: 38.2.1 - Desktop framework
- **Electron Builder**: 26.0.12 - Packaging
- **Electron DL**: File downloading

### Development
- **Babel**: ES6+ transpilation
- **Nodemon**: Auto-restart server
- **Concurrently**: Run multiple commands
- **Wait-on**: Wait for services

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start all services in development mode |
| `npm run react-start` | Start React development server only |
| `npm run react-build` | Build React for production |
| `npm run server-start` | Start Express server with hot reload |
| `npm run server-build` | Build Express server for production |
| `npm run electron-dev` | Launch Electron in development |
| `npm run electron-pack` | Package Electron app for current platform |
| `npm run electron-pack-arch32` | Package for 32-bit architecture |
| `npm run preelectron-pack` | Build all before packaging |

## 🎮 Usage Guide

### Initial Setup
1. Launch xHornet application
2. Login with default credentials:
   - Username: `admin`
   - Password: `password`
3. Configure bot settings in the control panel
4. Connect your wallet (MetaMask or private key)

### Bot Operation
1. **Configure Settings**: Set trade amount, slippage, and gas price
2. **Start Bot**: Click "Démarrer" in the control panel
3. **Monitor**: Watch for new listings in real-time
4. **Snipe**: Bot auto-executes or click "Sniper" manually
5. **Track**: View results in the activity feed

### Chat Monitoring
- Platform automatically monitors configured channels
- Sentiment analysis updates every 30 seconds
- Alerts appear for high-priority mentions
- Click on chat cards for detailed analysis

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```
6. Push to your branch
   ```bash
   git push origin feature/AmazingFeature
   ```
7. Open a Pull Request

### Code Standards
- Follow React best practices
- Use ESLint configuration
- Maintain responsive design
- Add JSDoc comments for functions
- Write meaningful commit messages
- Test on Windows, macOS, and Linux

## ⚠️ Security & Disclaimer

### Security Best Practices
- Never commit `.env` files
- Keep private keys encrypted
- Use environment variables for sensitive data
- Enable 2FA on all accounts
- Regular security audits

### Trading Disclaimer
**IMPORTANT**: This platform is for educational and informational purposes only.

⚠️ **Risks Include:**
- Cryptocurrency trading involves substantial risk of loss
- Market volatility can result in rapid losses
- Automated trading bots can malfunction
- Smart contract risks and vulnerabilities
- Regulatory and legal considerations

📢 **You Should:**
- Always do your own research (DYOR)
- Never invest more than you can afford to lose
- Understand the technology before using
- Keep software updated
- Use at your own risk

The developers and contributors of xHornet are not responsible for any financial losses, damages, or legal issues arising from the use of this software.

## 📞 Support

For support, questions, or bug reports:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/xHornet/issues)
- **Email**: support@xhornet.io
- **Discord**: [Join our community](https://discord.gg/xhornet)
- **Telegram**: [@xHornetSupport](https://t.me/xHornetSupport)

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic trading interface
- [x] Sniper bot functionality
- [x] Multi-platform chat analysis
- [x] Desktop application

### Phase 2 (Q2 2025)
- [ ] Real-time WebSocket integration
- [ ] Advanced charting with TradingView
- [ ] Multiple wallet support
- [ ] Portfolio tracking

### Phase 3 (Q3 2025)
- [ ] Mobile companion app
- [ ] AI-powered sentiment analysis
- [ ] Automated risk management
- [ ] Multi-language support (FR, ES, ZH)

### Phase 4 (Q4 2025)
- [ ] Multi-chain support (Polygon, Avalanche, Solana)
- [ ] Copy trading features
- [ ] Social trading community
- [ ] Advanced analytics dashboard

## 👨‍💻 Author

**Nour Ben Hadj Abdallah**
- GitHub: [@nourbenhadjabdallah](https://github.com/nourbenhadjabdallah)
- Email: nour@xhornet.io

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for excellent components
- Ethers.js community for blockchain tools
- Electron team for desktop framework
- Lucide for beautiful icons
- React community for best practices
- All contributors and testers

## 🌟 Star History

If you find xHornet helpful, please consider giving it a star! ⭐

---

**Built with ❤️ by crypto traders, for crypto traders**

*Made in Tunisia 🇹🇳*