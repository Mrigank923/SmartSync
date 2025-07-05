import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { setToken, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/');  // Go to board
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
