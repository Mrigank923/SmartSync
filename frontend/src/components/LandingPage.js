import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>Welcome to SmartSync</h1>
      <p>Organize, collaborate, and manage tasks in real-time!</p>
      <div className="landing-options">
        <div className="option-card" onClick={() => navigate('/register')}>
          <img src="https://www.svgrepo.com/show/347598/register.svg" alt="Register" />
          <button>Register</button>
        </div>
        <div className="option-card" onClick={() => navigate('/login')}>
          <img src="https://www.svgrepo.com/show/354066/login.svg" alt="Login" />
          <button>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
