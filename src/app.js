import React from 'react';
import {Route,HashRouter } from "react-router-dom"
import './css/main-interface.css';
import Login  from './pages/Login';

function App() {

  return (
    <HashRouter>

      <Route  path="/" component={Login} />


   </HashRouter>



  );
}

export default App;