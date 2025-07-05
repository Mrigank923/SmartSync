import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand">SmartSync</div>
      <div className="navbar-links">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </nav>
  );
};

export default Navbar;
