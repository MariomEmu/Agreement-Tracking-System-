import React from 'react';

export const AgreementDetails = ({ agreement, onBack, onPreview }) => {
  if (!agreement) {
    return (
      <div className="agreement-details">
        <div className="details-header">
          <h2>Agreement Details</h2>
        </div>
        <div className="loading">Loading agreement details...</div>
      </div>
    );
  }

  return (
    <div className="agreement-details">
      <div className="details-header">
        <h2>Agreement Details</h2>
      </div>

      <div className="details-section">
        <table className="details-table">
          <thead>
            <tr>
              <th>Agreement ID</th>
              <th>Agreement Reference</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{agreement.agreement_id || 'Not assigned'}</td>
              <td>{agreement.agreement_reference || 'Not specified'}</td>
              <td>{agreement.creator_name || 'Not specified'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="details-section">
        <h3>{agreement.title}</h3>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <label>Start Date</label>
          <div>{agreement.start_date}</div>
        </div>
        <div className="detail-item">
          <label>Expiry Date</label>
          <div>{agreement.expiry_date}</div>
        </div>
        <div className="detail-item">
          <label>Reminder Date</label>
          <div>{agreement.reminder_time}</div>
        </div>
        <div className="detail-item">
          <label>Department</label>
          <div>{agreement.agreement_type_name || agreement.department?.name || 'Not specified'}</div>
        </div>
        <div className="detail-item">
          <label>Status</label>
          <div>{agreement.status}</div>
        </div>
        <div className="detail-item">
          <label>Attachment</label>
          <div>
            {agreement.attachment ? (
              <a href={agreement.attachment} target="_blank" rel="noopener noreferrer">
                {agreement.original_filename || 'Download attachment'}
              </a>
            ) : (
              'No attachment'
            )}
          </div>
        </div>
      </div>

      <div className="users-section">
        <h4>Users with Access</h4>
        <ul>
          {agreement.assigned_users && agreement.assigned_users.length > 0 ? (
            agreement.assigned_users.map((user, index) => (
              <li key={index}>
                {user} <button className="remove-btn">X</button>
              </li>
            ))
          ) : (
            <li>No users assigned</li>
          )}
        </ul>
      </div>

      <div className="action-buttons">
        <button className="secondary-button" onClick={onPreview}>Preview</button>
        <button className="primary-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};