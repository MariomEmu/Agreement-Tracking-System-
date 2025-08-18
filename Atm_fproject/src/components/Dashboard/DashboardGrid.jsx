import { StatCard } from '../Common/StatCard';
import { AgreementChart } from '../Agreement/AgreementChart';
import { InvoiceChart } from '../Invoice/InvoiceChart';
import { Notifications } from '../Notifications';

export const DashboardGrid = () => {
  return (
    <div className="dashboard-grid">
      <div className="grid-section">
        <h2>Agreements</h2>
        <div className="stats-row">
          <StatCard title="Active Agreements" value="54" />
          <StatCard title="Agreements expire in 3 months" value="3" />
          <StatCard title="Expired Agreements" value="12" />
        </div>
        
        <div className="charts-row">
          <AgreementChart />
          {/* <div className="status-pie">
            <h3>Agreement by Status</h3>
            Pie chart implementation
          </div> */}
        </div>
      </div>

      <div className="grid-section">
        <h2>Invoices</h2>
        <div className="stats-row">
          <StatCard title="Submitted Invoices" value="54" />
          <StatCard title="Paid Invoices" value="3" />
          <StatCard title="Overdue Invoices" value="12" />
          <StatCard title="Cancelled Invoices" value="12" />
        </div>
        <InvoiceChart />
      </div>

      <Notifications />
    </div>
  );
};