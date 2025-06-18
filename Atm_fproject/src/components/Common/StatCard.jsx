export const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
    </div>
  );
};