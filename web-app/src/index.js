// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/index/App';
import './index.css';
import process from "process";
import PosLoginCompany from './components/PosLoginCompany/PosLoginCompany';
import PosLoginLandowner from './components/PosLoginLandowner/PosLoginLandowner';
import Payment from './components/Payment/Payment';
import AddLand from "./components/AddLand/addLand"
import { BrowserRouter as Router } from "react-router-dom";

// Create a root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
window.process = process;

root.render(
    <Router>
        <App/>
    </Router>,
);
