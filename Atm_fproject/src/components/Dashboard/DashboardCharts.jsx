import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2980b9', '#f39c12', '#e67e22', '#e74c3c', '#7f8c8d'];

export default function DashboardCharts({ agreementDeptData = [], agreementStatusData = [] }) {
  return (
    <div className="dashboard-charts">
      <div className="charts-row">
        <div className="chart-card">
          <h3>Agreements by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agreementDeptData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {agreementDeptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ marginBottom: 16 }}>Agreement by Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={agreementStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {agreementStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 24, minWidth: 160 }}>
              {agreementStatusData.map((entry, idx) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    marginRight: 8
                  }} />
                  <span style={{ color: '#333', fontWeight: 500, minWidth: 110 }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
}

