import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';
import Toast from '../Toast';

const Login = () => {
  const { setToken, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/kanban');
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || 'Login failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Login to SmartSync</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <label>Email</label>
        </div>

        <div className="form-group">
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <label>Password</label>
          <span className="toggle-password" onClick={() => setShowPassword(prev => !prev)}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
