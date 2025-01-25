// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// Aimport React from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
// Registering Syncfusion license key
import './index.css';
//if(true)

ReactDOM.render((
	<BrowserRouter>
<App />
	</BrowserRouter>
), document.getElementById('app'));
