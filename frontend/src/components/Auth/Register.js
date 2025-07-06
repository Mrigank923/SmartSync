import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Register.css';
import Toast from '../Toast';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      setToast({ message: 'Registered! Please check your email for OTP.', type: 'success' });
      localStorage.setItem('pendingEmail', email);
      navigate('/verify-otp');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
    }
  };

  return (
    <div className="register-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Create Your SmartSync Account</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <label>Username</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label>Email</label>
        </div>

        <div className="form-group">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label>Password</label>
          <span className="toggle-password" onClick={() => setShowPassword(prev => !prev)}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
