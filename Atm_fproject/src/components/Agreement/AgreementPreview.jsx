import React from 'react';

export default function AgreementPreview({ data, onSave, onEdit }) {
  return (
    <div className="agreement-preview" style={{maxWidth: 800, margin: '0 auto'}}>
      <h2>Agreement Details</h2>
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
        <button className="btn btn-primary" onClick={onSave}>Save</button>
        <button className="btn" style={{marginLeft: 12}} onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
} 