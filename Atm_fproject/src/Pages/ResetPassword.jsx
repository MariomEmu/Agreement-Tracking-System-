import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [linkGenerated, setLinkGenerated] = useState('');
  const navigate = useNavigate();
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLinkGenerated('');
 
    if (!email) {
      setError('Please enter your email.');
      return;
    }
 
    // ✅ Updated route
    const resetLink = `/forgot-password-reset?email=${encodeURIComponent(email)}`;
    setLinkGenerated(resetLink);
  };
 
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f9f8',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 32,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Reset Password</h2>
 
        <label>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          required
          style={{
            width: '100%',
            padding: 10,
            margin: '8px 0 16px 0',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
 
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
 
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 12,
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
          }}
        >
          Send Reset Link
        </button>
 
        {linkGenerated && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p>Reset link generated:</p>
            <button
              type="button"
              onClick={() => navigate("/forgot-password-reset")}
              style={{
                color: '#007bff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Click here to reset your password
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
 
export default ResetPassword;