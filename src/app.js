import React from 'react';
import { Routes, Route, HashRouter } from "react-router-dom";
import './css/main-interface.css';
import Login from './pages/Login/Login';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

export default App;