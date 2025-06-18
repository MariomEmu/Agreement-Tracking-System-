import React from 'react';
import DashboardCharts from './DashboardCharts';
import Dashboard2 from './Dashboard2';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Active Agreements</div>
          <div className="stat-value" style={{ color: '#2196f3' }}>54</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Agreements expire in 3 months</div>
          <div className="stat-value" style={{ color: '#ffb300' }}>3</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Expired Agreements</div>
          <div className="stat-value" style={{ color: '#e53935' }}>12</div>
        </div>
      </div>
      <DashboardCharts />
      <div className="invoice-stats-grid">
        <div className="invoice-stat-card">
          <div className="stat-title">Submitted Invoices</div>
          <div className="stat-value" style={{ color: '#2196f3' }}>54</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Paid Invoices</div>
          <div className="stat-value" style={{ color: '#43a047' }}>3</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Overdue Invoices</div>
          <div className="stat-value" style={{ color: '#ffb300' }}>12</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Cancelled Invoices</div>
          <div className="stat-value" style={{ color: '#e53935' }}>12</div>
        </div>
      </div>
      <Dashboard2/>
    </div>
  );
};

export default HeroSection;