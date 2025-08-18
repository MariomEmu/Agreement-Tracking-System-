import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/main.css';
import { BrowserRouter } from 'react-router-dom';
import { AgreementProvider } from './context/AgreementContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AgreementProvider>
    <App />
      </AgreementProvider>
    </BrowserRouter>
  </React.StrictMode>
);