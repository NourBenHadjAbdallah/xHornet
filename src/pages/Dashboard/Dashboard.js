  
  import React, { useState, useEffect } from 'react';
  import './dashboardStyle.css';
  
  export default function Dashboard() {
    const [user] = useState({ name: 'Trader' });
    const [time, setTime] = useState(new Date());
    const [botActive, setBotActive] = useState(true);
    const [tokens, setTokens] = useState([
      { id: 'MOON', pair: 'MOON/USDT', price: 0.00234, mcap: '$1.2M', change1h: 156 },
      { id: 'FLASH', pair: 'FLASH/BNB', price: 0.00891, mcap: '$890K', change1h: 89 },
      { id: 'GEM', pair: 'GEM/USDT', price: 0.01234, mcap: '$2.4M', change1h: 234 }
    ]);
    const [selectedToken, setSelectedToken] = useState(null);
    const [showSnipeModal, setShowSnipeModal] = useState(false);
    const [settings, setSettings] = useState({ amount: 0.1, slippage: 12, gasPrice: 5 });
    const [alerts, setAlerts] = useState([
      { id: 1, text: 'New listing detected: FLASH on PancakeSwap', level: 'high' },
      { id: 2, text: 'Gas price spiked to 20 Gwei', level: 'warning' }
    ]);
  
    useEffect(() => {
      const t = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(t);
    }, []);
  
    function handleStartBot() {
      setBotActive(true);
      setAlerts(a => [{ id: Date.now(), text: 'Bot started', level: 'info' }, ...a]);
    }
  
    function handleStopBot() {
      setBotActive(false);
      setAlerts(a => [{ id: Date.now(), text: 'Bot stopped', level: 'info' }, ...a]);
    }
  
    function handleSnipeClick(token) {
      setSelectedToken(token);
      setShowSnipeModal(true);
    }
  
    function confirmSnipe() {
      setShowSnipeModal(false);
      setAlerts(a => [{ id: Date.now(), text: `Sniper order placed for ${selectedToken.id}`, level: 'success' }, ...a]);
    }
  
    function updateSetting(key, value) {
      setSettings(s => ({ ...s, [key]: value }));
    }return (
      <main className="home-container updated">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="live-indicator">
              <div className="pulse-dot" /> LIVE
            </div>
            <div className="clock">{time.toLocaleTimeString('fr-FR')} — {time.toLocaleDateString('fr-FR')}</div>
          </div>

          <div className="topbar-right">
            <div className="wallet-connect">
              <button className="btn btn-outline">Connect Wallet</button>
            </div>
            <div className="bot-toggle">
              <span>Status:</span>
              <span className={`status-badge ${botActive ? 'status-active' : 'status-off'}`}>
                {botActive ? 'ACTIF' : 'OFF'}
              </span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="hero updated-hero">
          <div className="hero-left">
            <h1>Bienvenue, <span className="hero-name">{user.name}</span></h1>
            <p className="muted">Surveillez les nouveaux listings, analysez les discussions et sniper rapidement.</p>

            <div className="quick-stats">
              <div className="stat small">
                <div className="label">Profit total</div>
                <div className="value">+342%</div>
              </div>
              <div className="stat small">
                <div className="label">Trades actifs</div>
                <div className="value">127</div>
              </div>
              <div className="stat small">
                <div className="label">Listings (24h)</div>
                <div className="value">23</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="chart-card">Price / Volume chart (placeholder)</div>
            <div className="chart-card small">Sentiment sparkline (placeholder)</div>
          </div>
        </section>

        {/* Control Panel */}
        <section className="control-section updated-control">
          <div className="control-left">
            <h2>Panneau du Bot</h2>
            <div className="bot-controls">
              <button className="control-btn btn-success" onClick={handleStartBot}>Démarrer</button>
              <button className="control-btn btn-danger" onClick={handleStopBot}>Arrêter</button>
              <button className="control-btn btn-warning" onClick={() => setAlerts(a => [{ id: Date.now(), text: 'Paramètres réinitialisés', level: 'info' }, ...a])}>Réinitialiser</button>
            </div>

            <div className="settings-quick">
              <label>Montant par trade</label>
              <input type="number" value={settings.amount} onChange={e => updateSetting('amount', parseFloat(e.target.value) || 0)} />
              <label>Slippage %</label>
              <input type="number" value={settings.slippage} onChange={e => updateSetting('slippage', parseFloat(e.target.value) || 0)} />
              <label>Gas Price (Gwei)</label>
              <input type="number" value={settings.gasPrice} onChange={e => updateSetting('gasPrice', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <aside className="control-right">
            <h3>Alerts récentes</h3>
            <ul className="alerts-list">
              {alerts.map(a => (
                <li key={a.id} className={`alert-item ${a.level}`}>
                  {a.text}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* Listings */}
        <section className="listings-section updated-listings">
          <h2>Nouveaux listings détectés</h2>
          <div className="listings-table">
            <div className="table-row table-header">
              <div>Token</div>
              <div>Prix</div>
              <div>Market Cap</div>
              <div>1h</div>
              <div>Action</div>
            </div>

            {tokens.map(t => (
              <div key={t.id} className="table-row">
                <div className="token-info">
                  <div className="token-icon">🚀</div>
                  <div>
                    <div className="token-name">{t.id}</div>
                    <div className="token-symbol">{t.pair}</div>
                  </div>
                </div>
                <div>{t.price}</div>
                <div>{t.mcap}</div>
                <div className={t.change1h > 0 ? 'change-positive' : 'change-negative'}>{t.change1h}%</div>
                <div>
                  <button className="action-btn btn-snipe" onClick={() => handleSnipeClick(t)}>Sniper</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chat Section */}
        <section className="chat-section updated-chat">
          <h2>Analyse des chats</h2>
          <div className="chat-grid">
            <div className="chat-card">
              <h3>Telegram - Crypto Signals</h3>
              <p className="muted">Sentiment: <strong>BULLISH</strong></p>
              <p>Mentions: BTC, ETH, MOON</p>
            </div>

            <div className="chat-card">
              <h3>Discord - DeFi Traders</h3>
              <p className="muted">Sentiment: NEUTRAL</p>
              <p>Mentions: AVAX, SOL</p>
            </div>

            <div className="chat-card">
              <h3>Twitter</h3>
              <p className="muted">Trending: #Bitcoin</p>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="activity-section updated-activity">
          <h2>Activité récente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-success">✓</div>
              <div>
                <div className="activity-title">Trade exécuté: MOON/USDT</div>
                <div className="activity-time">Profit: +45% — Il y a 5 minutes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Snipe Modal */}
        {showSnipeModal && selectedToken && (
          <div className="modal-backdrop" onClick={() => setShowSnipeModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Confirmer Sniper</h3>
              <p>Voulez-vous lancer une opération sniper sur <strong>{selectedToken.id}</strong> ?</p>
              <div className="modal-actions">
                <button className="control-btn btn-danger" onClick={() => setShowSnipeModal(false)}>Annuler</button>
                <button className="control-btn btn-success" onClick={confirmSnipe}>Confirmer</button>
              </div>
            </div>
          </div>
        )}
      </main>
        );
}