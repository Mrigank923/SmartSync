import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOtp from './components/Auth/VerifyOtp';
import LandingPage from './components/LandingPage';
import KanbanBoard from './components/KanbanBoard';
import LogsPage from './components/LogsPage';


const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
