import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgreementPreview({ data, onSave, onEdit, viewMode }) {
  const navigate = useNavigate();
  return (
    <div className="agreement-preview" style={{width: '100%', maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Agreement Details</h2>
      <div className="preview-row">
        <div className="preview-group">
          <label>Agreement ID</label>
          <div>{data.agreementId}</div>
        </div>
        <div className="preview-group">
          <label>Agreement Reference</label>
          <div>{data.agreementReference}</div>
        </div>
        <div className="preview-group">
          <label>Type</label>
          <div>{data.type}</div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group" style={{flex: 1}}>
          <label>Agreement Title</label>
          <div>{data.agreementTitle}</div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group">
          <label>Start Date</label>
          <div>{data.startDate}</div>
        </div>
        <div className="preview-group">
          <label>Expiry Date</label>
          <div>{data.expiryDate}</div>
        </div>
        <div className="preview-group">
          <label>Reminder Date</label>
          <div>{data.reminderDate}</div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group">
          <label>Department</label>
          <div>{data.department}</div>
        </div>
        <div className="preview-group">
          <label>Status</label>
          <div>{data.status}</div>
        </div>
        <div className="preview-group">
          <label>Attachment</label>
          <div>{data.attachment ? data.attachment.name : 'No file uploaded'}</div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group" style={{flex: 1}}>
          <label>Users with Access</label>
          <div>{(data.usersWithAccess || []).join(', ')}</div>
        </div>
      </div>
      <div className="form-actions" style={{marginTop: 24}}>
        {viewMode ? (
          <button className="btn btn-primary" onClick={() => navigate('/agreements')} style={{backgroundColor: '#008fd5'}}>Back</button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onSave} style={{backgroundColor: '#008fd5'}}>Save</button>
            <button className="btn" style={{marginLeft: 12}} onClick={onEdit}>Edit</button>
          </>
        )}
      </div>
    </div>
  );
} 