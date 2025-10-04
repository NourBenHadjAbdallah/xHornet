import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, RefreshCw } from 'lucide-react';
import './chartStyle.css';

export default function ChartPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [timeframe, setTimeframe] = useState('1');
  const [chartType, setChartType] = useState('line');
  const [coinData, setCoinData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Popular coins list with their CoinGecko IDs
  const coinDatabase = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', coingeckoId: 'bitcoin' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', coingeckoId: 'ethereum' },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', coingeckoId: 'binancecoin' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', coingeckoId: 'dogecoin' },
    { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', coingeckoId: 'shiba-inu' },
    { id: 'pepe', name: 'Pepe', symbol: 'PEPE', coingeckoId: 'pepe' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', coingeckoId: 'solana' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', coingeckoId: 'cardano' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP', coingeckoId: 'ripple' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', coingeckoId: 'polkadot' },
    { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', coingeckoId: 'avalanche-2' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', coingeckoId: 'chainlink' },
    { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', coingeckoId: 'uniswap' },
    { id: 'mantle', name: 'Mantle', symbol: 'MNT', coingeckoId: 'mantle' },
    { id: 'floki', name: 'Floki Inu', symbol: 'FLOKI', coingeckoId: 'floki' },
  ];

  const [filteredCoins, setFilteredCoins] = useState(coinDatabase);

  // Fetch coin data from CoinGecko API
  const fetchCoinData = async (coinId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      
      if (!response.ok) throw new Error('Failed to fetch coin data');
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to load coin data. Please try again.');
      console.error('Error fetching coin data:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical chart data
  const fetchHistoricalData = async (coinId, days) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch chart data');
      
      const data = await response.json();
      
      // Format data for recharts
      const formattedData = data.prices.map((price, index) => ({
        time: new Date(price[0]).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(days > 1 && { day: '2-digit', month: '2-digit' })
        }),
        price: price[1],
        volume: data.total_volumes[index] ? data.total_volumes[index][1] : 0
      }));
      
      setHistoricalData(formattedData);
    } catch (err) {
      setError('Failed to load chart data. Please try again.');
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle coin selection
  const handleCoinSelect = async (coin) => {
    setSelectedCoin(null);
    const data = await fetchCoinData(coin.coingeckoId);
    if (data) {
      setSelectedCoin({
        ...coin,
        price: data.market_data.current_price.usd,
        change: data.market_data.price_change_percentage_24h,
        mcap: data.market_data.market_cap.usd,
        volume: data.market_data.total_volume.usd,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        ath: data.market_data.ath.usd,
        athChange: data.market_data.ath_change_percentage.usd,
        circulatingSupply: data.market_data.circulating_supply,
        totalSupply: data.market_data.total_supply,
        image: data.image.small
      });
      await fetchHistoricalData(coin.coingeckoId, timeframe);
    }
  };

  // Update chart when timeframe changes
  useEffect(() => {
    if (selectedCoin) {
      fetchHistoricalData(selectedCoin.coingeckoId, timeframe);
    }
  }, [timeframe]);

  // Filter coins based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCoins(coinDatabase);
    } else {
      const filtered = coinDatabase.filter(coin => 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCoins(filtered);
    }
  }, [searchQuery]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-price">${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
          <p className="tooltip-volume">
            Vol: ${(payload[0].payload.volume / 1000000).toFixed(2)}M
          </p>
        </div>
      );
    }
    return null;
  };

  const formatMarketCap = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="chart-page">
      {/* Header */}
      <header className="chart-header">
        <div>
          <h1>
            <BarChart3 className="header-icon" size={28} />
            Chart Analysis
          </h1>
          <p>Real-time price tracking with CoinGecko API</p>
        </div>
        {selectedCoin && (
          <button 
            className="refresh-btn"
            onClick={() => handleCoinSelect(selectedCoin)}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        )}
      </header>

      <div className="chart-layout">
        {/* Sidebar - Coin List */}
        <aside className="coin-sidebar">
          {/* Search */}
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Coin List */}
          <div className="coin-list">
            {filteredCoins.map(coin => (
              <div
                key={coin.id}
                onClick={() => handleCoinSelect(coin)}
                className={`coin-item ${selectedCoin?.id === coin.id ? 'active' : ''}`}
              >
                <div className="coin-item-content">
                  <div>
                    <div className="coin-name">{coin.name}</div>
                    <div className="coin-symbol">{coin.symbol}/USD</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chart Area */}
        <main className="chart-main">
          {loading && !selectedCoin ? (
            <div className="loading-state">
              <RefreshCw size={48} className="spinning" />
              <p>Loading coin data...</p>
            </div>
          ) : error && !selectedCoin ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : selectedCoin ? (
            <>
              {/* Coin Info Header */}
              <div className="coin-info-card">
                <div className="coin-info-header">
                  <div className="coin-info-left">
                    {selectedCoin.image && (
                      <img src={selectedCoin.image} alt={selectedCoin.name} className="coin-image" />
                    )}
                    <div>
                      <h2>{selectedCoin.name}</h2>
                      <p className="coin-symbol-large">{selectedCoin.symbol}/USD</p>
                    </div>
                  </div>
                  
                  <div className="coin-info-right">
                    <div className="coin-price">
                      ${selectedCoin.price < 1 
                        ? selectedCoin.price.toFixed(8) 
                        : selectedCoin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      }
                    </div>
                    <div className={`coin-change ${selectedCoin.change >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCoin.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      {selectedCoin.change >= 0 ? '+' : ''}{selectedCoin.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Market Cap</div>
                    <div className="stat-value">{formatMarketCap(selectedCoin.mcap)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">24h Volume</div>
                    <div className="stat-value">{formatMarketCap(selectedCoin.volume)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">24h High</div>
                    <div className="stat-value">${selectedCoin.high24h.toFixed(2)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">24h Low</div>
                    <div className="stat-value">${selectedCoin.low24h.toFixed(2)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">All Time High</div>
                    <div className="stat-value">${selectedCoin.ath.toFixed(2)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">ATH Change</div>
                    <div className={`stat-value ${selectedCoin.athChange >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCoin.athChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="chart-controls">
                {/* Timeframe */}
                <div className="control-group">
                  {[
                    { label: '24H', value: '1' },
                    { label: '7D', value: '7' },
                    { label: '30D', value: '30' },
                    { label: '90D', value: '90' },
                    { label: '1Y', value: '365' }
                  ].map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`control-btn ${timeframe === tf.value ? 'active' : ''}`}
                      disabled={loading}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Chart Type */}
                <div className="control-group">
                  <button
                    onClick={() => setChartType('line')}
                    className={`control-btn ${chartType === 'line' ? 'active' : ''}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`control-btn ${chartType === 'area' ? 'active' : ''}`}
                  >
                    Area
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-container">
                {loading ? (
                  <div className="chart-loading">
                    <RefreshCw size={32} className="spinning" />
                    <p>Loading chart data...</p>
                  </div>
                ) : historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12, fill: '#555' }}
                          stroke="#e0e0e0"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#555' }}
                          stroke="#e0e0e0"
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#ffd60a" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={historicalData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffd60a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ffd60a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12, fill: '#555' }}
                          stroke="#e0e0e0"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#555' }}
                          stroke="#e0e0e0"
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#ffd60a" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-error">
                    <p>No chart data available</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="action-buttons">
                <button className="action-btn btn-buy">
                  Buy {selectedCoin.symbol}
                </button>
                <button className="action-btn btn-sell">
                  Sell {selectedCoin.symbol}
                </button>
                <button className="action-btn btn-alert">
                  Set Alert
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Activity size={64} />
              <h3>Select a coin to view chart</h3>
              <p>Choose from the list on the left to analyze real-time price movements</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}