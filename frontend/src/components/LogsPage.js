import React, { useEffect, useState } from 'react';
import api from '../services/api';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data);
    } catch (err) {
      alert('Failed to load logs');
    }
  };

  return (
    <div className="logs-page" style={{ padding: '20px' }}>
      <h2>Action Logs</h2>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx}>
            <strong>{log.actionType}</strong> by {log.user?.username || 'Unknown'} on {log.task?.title || 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogsPage;
