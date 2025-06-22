import React, { useState, useEffect } from 'react';
import { useAgreementContext } from '../../context/AgreementContext';

const departments = [
  'Business Development (BD)',
  'Finance',
  'Admin',
  'IT',
  'HR',
];
const statuses = ['Active', 'Expired', 'Cancelled'];
const types = ['Malaysia', 'Bangladesh', 'India'];
const users = ['Saim Bin Selim', 'Aynur Rahman', 'S M Jahangir Akhter'];

export default function AgreementForm({ onSubmit, initialData }) {
  const { isEditing } = useAgreementContext();
  
  const [form, setForm] = useState({
    agreementId: '',
    agreementReference: '',
    type: '',
    agreementTitle: '',
    startDate: '',
    expiryDate: '',
    reminderDate: '',
    department: '',
    status: '',
    attachment: null,
    usersWithAccess: [],
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setForm({
        agreementId: initialData.agreementId || '',
        agreementReference: initialData.agreementReference || '',
        type: initialData.type || '',
        agreementTitle: initialData.agreementTitle || '',
        startDate: initialData.startDate || '',
        expiryDate: initialData.expiryDate || '',
        reminderDate: initialData.reminderDate || '',
        department: initialData.department || '',
        status: initialData.status || '',
        attachment: initialData.attachment || null,
        usersWithAccess: initialData.usersWithAccess || [],
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: e.target.files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUserChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, usersWithAccess: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="agreement-form" onSubmit={handleSubmit} style={{maxWidth: 800, margin: '0 auto'}}>
      <h2>{isEditing ? 'Edit Agreement' : 'Agreement Details'}</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Agreement ID</label>
          <input name="agreementId" value={form.agreementId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Agreement Reference</label>
          <input name="agreementReference" value={form.agreementReference} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="">Select Type</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{flex: 1}}>
          <label>Agreement Title</label>
          <input name="agreementTitle" value={form.agreementTitle} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Reminder Date</label>
          <input type="date" name="reminderDate" value={form.reminderDate} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Department</label>
          <select name="department" value={form.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Attachment</label>
          <input type="file" name="attachment" onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{flex: 1}}>
          <label>Users with Access</label>
          <select name="usersWithAccess" multiple value={form.usersWithAccess} onChange={handleUserChange} style={{height: 60}}>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="form-actions" style={{marginTop: 24}}>
        <button type="submit" className="btn btn-primary" style={{backgroundColor: '#008fd5'}}>
          {isEditing ? 'Update Agreement' : 'Preview'}
        </button>
        <button type="button" className="btn" style={{marginLeft: 12}} onClick={() => window.history.back()}>Back</button>
      </div>
    </form>
  );
} 