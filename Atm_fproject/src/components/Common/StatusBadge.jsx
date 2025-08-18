import React from 'react';

const statusColors = {
  ongoing: '#27ae60',
  expired: '#e74c3c',
  Cancelled: '#e67e22',
  Overdue: '#e67e22',
  Paid: '#27ae60',
  Submitted: '#2980b9',
  Default: '#7f8c8d',
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || statusColors.Default;
  return (
    <span style={{
      background: color,
      color: '#fff',
      borderRadius: '12px',
      padding: '2px 10px',
      fontSize: '0.85em',
      fontWeight: 500,
      display: 'inline-block',
      minWidth: 70,
      textAlign: 'center',
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
