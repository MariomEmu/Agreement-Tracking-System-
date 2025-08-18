import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage(response.data.success || 'Password changed!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error changing password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Change Password</h2>
      <div className="form-group">
        <label>Old Password</label>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="form-control" />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="form-control" />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="form-control" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 16 }}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
      {message && <div style={{ marginTop: 16, color: message.includes('success') ? 'green' : 'red', textAlign: 'center' }}>{message}</div>}
    </form>
  );
} 