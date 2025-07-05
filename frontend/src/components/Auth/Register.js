import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      alert('Registered! Please check your email for OTP.');
      localStorage.setItem('pendingEmail', email);
      navigate('/verify-otp');

    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <h2>Register</h2>
      <input
        type="text"
        value={username}
        placeholder="Username"
        onChange={e => setUsername(e.target.value)}
        required
      />
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
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
