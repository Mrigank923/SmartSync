import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">

      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to <span className="brand">SmartSync</span></h1>
          <p className="tagline">Your smart task management partner</p>
          <p className="description">
            Collaborate with your team, manage tasks visually, 
            and automate assignment with SmartSync's intelligent board. 
            Stay in sync with real-time updates and conflict protection.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/register')}>Get Started</button>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/tasks_board.png" alt="Task board preview" />
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <img src="/images/todo_list.png" alt="To-do list" />
          <div>
            <h3>Stay organized</h3>
            <p>Visualize your tasks with an intuitive Kanban board and personalized to-do lists.</p>
          </div>
        </div>
        <div className="feature">
          <img src="/images/smartassign.png" alt="Smart assign" />
          <div>
            <h3>Smart Assign</h3>
            <p>Let SmartSync automatically assign tasks to the least-busy team member.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
