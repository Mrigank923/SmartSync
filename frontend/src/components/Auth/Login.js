import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './AuthForms.css';
import Toast from '../Toast';

const Login = () => {
  const { setToken, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/kanban');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
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

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
