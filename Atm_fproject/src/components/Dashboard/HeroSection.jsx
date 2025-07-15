import React, { useEffect, useState } from 'react';
import DashboardCharts from './DashboardCharts';
import Dashboard2 from './Dashboard2';
import axiosInstance from '../../axiosConfig';

const POLL_INTERVAL = 10000; // 10 seconds

const staticInvoiceStats = {
  submitted: 54,
  paid: 3,
  overdue: 12,
  cancelled: 12,
};

const HeroSection = () => {
  const [agreementStats, setAgreementStats] = useState({
    active: 0,
    expiringSoon: 0,
    expired: 0,
    agreementDeptData: [],
    agreementStatusData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // Example endpoint: /dashboard-stats/ (you may need to adjust this to your actual API)
      const response = await axiosInstance.get('dashboard-stats/');
      setAgreementStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="hero-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Active Agreements</div>
          <div className="stat-value" style={{ color: '#2196f3' }}>{agreementStats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Agreements expire in 3 months</div>
          <div className="stat-value" style={{ color: '#ffb300' }}>{agreementStats.expiringSoon}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Expired Agreements</div>
          <div className="stat-value" style={{ color: '#e53935' }}>{agreementStats.expired}</div>
        </div>
      </div>
      <DashboardCharts 
        agreementDeptData={agreementStats.agreementDeptData}
        agreementStatusData={agreementStats.agreementStatusData}
      />
      <div className="invoice-stats-grid">
        <div className="invoice-stat-card">
          <div className="stat-title">Submitted Invoices</div>
          <div className="stat-value" style={{ color: '#2196f3' }}>{staticInvoiceStats.submitted}</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Paid Invoices</div>
          <div className="stat-value" style={{ color: '#43a047' }}>{staticInvoiceStats.paid}</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Overdue Invoices</div>
          <div className="stat-value" style={{ color: '#ffb300' }}>{staticInvoiceStats.overdue}</div>
        </div>
        <div className="invoice-stat-card">
          <div className="stat-title">Cancelled Invoices</div>
          <div className="stat-value" style={{ color: '#e53935' }}>{staticInvoiceStats.cancelled}</div>
        </div>
      </div>
      <Dashboard2 />
    </div>
  );
};

export default HeroSection;