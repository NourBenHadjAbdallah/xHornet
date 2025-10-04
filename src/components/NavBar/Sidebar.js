import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ChartCandlestick ,
  Bot,
} from 'lucide-react';
import './sidebarStyle.css';

export default function SideBar({ user, activeNav, setActiveNav, setIsOpen, }) {
    const navigation = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
    },
    {
      title: "Chart",
      icon: ChartCandlestick ,
      id: "chart",
    },
    {
      title: "Bot Settings",
      icon: Bot,
      id: "bot",
    },
    {
      title: "Wallet",
      icon: Wallet,
      id: "wallet",
    }
  ];
  
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-circle small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <div className="brand-text">Crypto Sniper</div>
      </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (setIsOpen) setIsOpen(false);
              }}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            >
              <item.icon className="nav-item-icon" size={20} />
              {item.title}
            </button>
          ))}
        </nav>

      <div className="sidebar-footer">
        <div className="user-mini">{user?.name || 'Guest'}</div>
        <button className="logout-btn small" onClick={() => window.location.reload()}>Déconnexion</button>
      </div>
    </aside>
  );
}
