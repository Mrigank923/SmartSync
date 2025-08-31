import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';
import Toast from '../Toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingEmail');
    const storedPassword = localStorage.getItem('pendingPassword');
    if (!storedEmail) {
      setToast({ message: 'No pending email found. Please register again.', type: 'error' });
      navigate('/register');
    } else {
      setEmail(storedEmail);
      if (storedPassword) {
        setPassword(storedPassword);
      }
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
    setLoading(true);
    try {
      const finalOtp = otp.join('');
      
      // First, verify the OTP
      await api.post('/auth/verify-otp', { email, otp: finalOtp });
      
      // Then, automatically login the user
      const loginResponse = await api.post('/auth/login', { email, password });
      
      // Set authentication state
      setToken(loginResponse.data.token);
      setUser(loginResponse.data.user);
      
      // Clean up stored data
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingPassword');
      
      setToast({ message: 'Email verified and logged in successfully!', type: 'success' });
      setTimeout(() => navigate('/kanban'), 1500);
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || 'Verification failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
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
              disabled={loading}
            />
          ))}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying & Logging in...' : 'Verify & Login'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
