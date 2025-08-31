import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { socket } from '../../services/socket';
import { RoomContext } from '../../context/RoomContext';
import './ActionLog.css';

const ActionLog = () => {
  const { currentRoom } = useContext(RoomContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();

    const updateListener = () => loadLogs();

    // only listen to socket in room mode
    if (currentRoom) {
      socket.on('log:update', updateListener);
    }

    return () => {
      socket.off('log:update', updateListener);
    };
  }, [currentRoom]);

  const loadLogs = async () => {
    try {
      const endpoint = currentRoom ? `/logs/rooms/${currentRoom}` : '/logs';
      const { data } = await api.get(endpoint);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  /* Get action icon based on type */
  const getActionIcon = (actionType) => {
    switch(actionType) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'assign': return '👤';
      default: return '📝';
    }
  };

  /* Get color style for action type */
  const getActionTypeStyle = (actionType) => {
    switch(actionType) {
      case 'create': 
        return { backgroundColor: '#e8f5e9', color: '#2e7d32' }; // Green
      case 'update': 
        return { backgroundColor: '#e3f2fd', color: '#1565c0' }; // Blue
      case 'delete': 
        return { backgroundColor: '#ffebee', color: '#c62828' }; // Red
      case 'assign': 
        return { backgroundColor: '#fff8e1', color: '#f57f17' }; // Amber
      default: 
        return { backgroundColor: '#e0e0e0', color: '#424242' }; // Grey
    }
  };

  /* Format timestamp */
  const formatTime = (timestamp) => {
    if (!timestamp) {
      return 'Unknown time';
    }
    
    // Check if the timestamp is valid
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  return (
    <div className="action-log">
      <h3>Recent Actions</h3>
      <div className="log-cards-container">
        {logs.length === 0 ? (
          <div className="log-empty-state">No recent activity</div>
        ) : (
          logs.map(log => (
            <div 
              key={log._id || `log-${Math.random()}`} 
              className="log-card" 
              data-action={log.actionType}
            >
              <div className="log-icon">
                {getActionIcon(log.actionType)}
              </div>
              <div className="log-content">
                <div className="log-header">
                  <span 
                    className="log-type" 
                    style={getActionTypeStyle(log.actionType)}
                  >
                    {log.actionType || 'ACTION'}
                  </span>
                  <span className="log-time">{formatTime(log.timestamp)}</span>
                </div>
                <div className="log-details">
                  <strong>{log.user?.username || 'Unknown'}</strong> 
                  {log.actionType === 'ASSIGN' || log.actionType === 'SMART_ASSIGN'
                    ? ' assigned to '
                    : ' modified '}
                  <span className="task-title">{log.task?.title || 'Unknown task'}</span>
                </div>
                {log.details && (
                  <div className="log-additional-details">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionLog;
