import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAgreementContext } from '../../context/AgreementContext';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const badgeStyle = {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  };

  const statusStyle = {
    Active: { backgroundColor: '#28a745' },
    Expired: { backgroundColor: '#dc3545' },
    Cancelled: { backgroundColor: '#6c757d' },
  };

  return (
    <span style={{ ...badgeStyle, ...statusStyle[status] }}>
      {status}
    </span>
  );
};

export default function AgreementList({ agreements }) {
  const { startEditing, deleteAgreement, prepareNewAgreement } = useAgreementContext();
  const navigate = useNavigate();

  const handleCreate = () => {
    prepareNewAgreement();
    navigate('/agreements/create');
  };

  const handleEdit = (agreement) => {
    startEditing(agreement);
    navigate('/agreements/create');
  };

  const handleDelete = (agreementId) => {
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      deleteAgreement(agreementId);
    }
  };
  
  return (
    <div className="agreement-list" style={{width: '100%', maxWidth: '1200px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>My Agreements</h2>
        <button onClick={handleCreate} className="btn btn-primary" style={{textDecoration: 'none', border: 'none', color: '#fff', background: '#007bff', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer'}}>Create New Agreement</button>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{borderBottom: '2px solid #eee'}}>
            <th style={{padding: '1rem', textAlign: 'left'}}>Title</th>
            <th style={{padding: '1rem', textAlign: 'left'}}>Department</th>
            <th style={{padding: '1rem', textAlign: 'left'}}>Status</th>
            <th style={{padding: '1rem', textAlign: 'left'}}>Start Date</th>
            <th style={{padding: '1rem', textAlign: 'left'}}>Expiry Date</th>
            <th style={{padding: '1rem', textAlign: 'left'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agreements.map((agreement, index) => (
            <tr key={index} style={{borderBottom: '1px solid #eee'}}>
              <td style={{padding: '1rem'}}>{agreement.agreementTitle}</td>
              <td style={{padding: '1rem'}}>{agreement.department}</td>
              <td style={{padding: '1rem'}}><StatusBadge status={agreement.status} /></td>
              <td style={{padding: '1rem'}}>{agreement.startDate}</td>
              <td style={{padding: '1rem'}}>{agreement.expiryDate}</td>
              <td style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <Link to={`/agreements/preview/${agreement.agreementId}`} style={{ color: '#007bff' }}>
                  <FiEye size={18} />
                </Link>
                <button onClick={() => handleEdit(agreement)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#28a745' }}>
                  <FiEdit size={18} />
                </button>
                <button onClick={() => handleDelete(agreement.agreementId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#dc3545' }}>
                  <FiTrash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 