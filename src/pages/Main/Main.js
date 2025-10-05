import React, { useState, useEffect } from 'react';
import SideBar from '../../components/NavBar/SideBar';
import ChatBot from '../../components/Bot/chatBot';
import Dashboard from '../Dashboard/Dashboard';
import ChartPage from '../Chart/Chart';

export default function Main() {
    const [user] = useState({ name: 'Trader' });
    const [activeNav, setActiveNav] = useState('dashboard');



  return (
    <div className="home-shell">
      <SideBar user={user}             
        activeNav={activeNav}
        setActiveNav={setActiveNav}/>
      {activeNav === 'dashboard' && (
        <Dashboard></Dashboard>
      )}
      {activeNav === 'chart' && (
        <ChartPage></ChartPage>
      )}


      <ChatBot />
    </div>
  );
}
