import React, { useState } from 'react';
 
const ForgotPasswordReset = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
 
  const handleSubmit = (e) => {
    e.preventDefault();
 
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
 
    // You can call your backend API here to update the password
    // For now, just showing success message
    setMessage("Password has been successfully reset!");
  };
 
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '400px',
        margin: '4rem auto',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#222' }}>
        Reset Your Password
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            htmlFor="newPassword"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outlineColor: '#007bff',
            }}
            placeholder="Enter your new password"
          />
        </div>
 
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outlineColor: '#007bff',
            }}
            placeholder="Confirm your new password"
          />
        </div>
 
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.9rem',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Reset Password
        </button>
 
        {message && (
          <p
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              color: message.includes('successfully') ? 'green' : 'red',
              fontWeight: '600',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};
 
export default ForgotPasswordReset;