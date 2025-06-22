import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DUMMY_EMAIL = 'demo.sonali@gmail.com';
const DUMMY_PASSWORD = 'password123';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      navigate('/');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', background: '#f7f9f8', marginLeft: '25vw' }}>
      <div style={{ display: 'flex', width: '900px', minHeight: '600px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Left Side */}
        <div style={{ flex: 1, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
        <img src="/Login Page.png" alt="Login Page" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* Right Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
          <form onSubmit={handleSubmit} style={{ width: 320, padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', background: '#fff' }}>
            <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>SIGN IN</h2>
            <label style={{ fontWeight: 500 }}>Your Email ID <span style={{ color: 'red' }}> *</span></label>
            <input
              type="email"
              placeholder="Example: abc@sonaliintellect.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: 10, margin: '8px 0 16px 0', borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label style={{ fontWeight: 500 }}>Your Password <span style={{ color: 'red' }}> *</span></label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: 10, margin: '8px 0 16px 0', borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            <button type="submit" style={{ width: '100%', padding: 12, background: '#000', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}>
              Sign In
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 16 }}>
              <span>Forgot Username, Password?</span>
              <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>Contact System Admin</a>
            </div>
          </form>
          <div style={{ marginTop: 32, fontSize: 13, color: '#888' }}>Copyright © 2025 All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 