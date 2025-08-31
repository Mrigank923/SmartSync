import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        SmartSync
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            <button onClick={() => navigate('/kanban')}>Board</button>
            <button onClick={() => navigate('/rooms')}>Rooms</button>
            <button onClick={() => navigate('/logs')}>Logs</button>
            {user && (
              <span className="user-info">
                Welcome, {user.username}!
              </span>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
