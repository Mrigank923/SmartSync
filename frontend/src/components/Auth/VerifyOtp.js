import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingEmail');
    if (!storedEmail) {
      alert('No pending email found. Please register again.');
      navigate('/register');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/verify-otp', { email, otp });
      alert('Email verified! Please login.');
      localStorage.removeItem('pendingEmail');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleVerify}>
      <h2>Verify OTP</h2>
      <p>We sent an OTP to: <strong>{email}</strong></p>
      <input
        type="text"
        value={otp}
        placeholder="Enter OTP"
        onChange={e => setOtp(e.target.value)}
        required
      />
      <button type="submit">Verify</button>
    </form>
  );
};

export default VerifyOtp;
