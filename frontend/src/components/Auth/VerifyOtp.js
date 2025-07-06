import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const inputsRef = useRef([]);
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

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalOtp = otp.join('');
      await api.post('/auth/verify-otp', { email, otp: finalOtp });
      alert('Email verified! Please login.');
      localStorage.removeItem('pendingEmail');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>
      <p>Sent to: <strong>{email}</strong></p>
      <div className="otp-boxes">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputsRef.current[idx] = el}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
          />
        ))}
      </div>
      <button type="submit">Verify</button>
    </form>
  );
};

export default VerifyOtp;
