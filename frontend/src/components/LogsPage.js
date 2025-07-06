import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './LogsPage.css';

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

  const getBadgeClass = (actionType) => {
    switch (actionType) {
      case 'CREATE': return 'badge-create';
      case 'UPDATE': return 'badge-update';
      case 'DELETE': return 'badge-delete';
      default: return 'badge-default';
    }
  };

  return (
    <div className="logs-container">
      <h2>📝 Action Logs</h2>
      <div className="logs-list">
        {logs.length === 0 ? (
          <p className="no-logs">No logs found.</p>
        ) : (
          logs.map((log, idx) => (
            <div className="log-card" key={idx}>
              <span className={`badge ${getBadgeClass(log.actionType)}`}>
                {log.actionType}
              </span>
              <div className="log-info">
                <p>
                  <strong>User:</strong> {log.user?.username || 'Unknown'}
                </p>
                <p>
                  <strong>Task:</strong> {log.task?.title || 'N/A'}
                </p>
                <p className="log-time">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsPage;
