import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AuthForms.css';
import Toast from '../Toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingEmail');
    if (!storedEmail) {
      setToast({ message: 'No pending email found. Please register again.', type: 'error' });
      navigate('/register');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
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
      setToast({ message: 'Email verified! Please login.', type: 'success' });
      localStorage.removeItem('pendingEmail');
      navigate('/login');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'OTP verification failed', type: 'error' });
    }
  };

  return (
    <div className="auth-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Verify Your Email</h2>
      <p className="otp-email">Sent to: <strong>{email}</strong></p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="otp-boxes">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputsRef.current[idx] = el}
              type="text"
              maxLength="1"
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              required
            />
          ))}
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
