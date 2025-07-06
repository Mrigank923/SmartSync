import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import './ActionLog.css';

const ActionLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();

    socket.on('log:update', () => {
      loadLogs();
    });

    return () => {
      socket.off('log:update');
    };
  }, []);

  const loadLogs = async () => {
    const res = await api.get('/logs');
    setLogs(res.data);
  };

  return (
    <div className="action-log">
      <h3>Recent Actions</h3>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx}>
            <strong>{log.actionType}</strong> by {log.user?.username || 'Unknown'} on task {log.task?.title || 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActionLog;
