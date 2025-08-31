import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { socket } from '../../services/socket';
import { RoomContext } from '../../context/RoomContext';
import './ActionLog.css';

/* ------------ Types ---------------- */
export interface LogUser {
  _id: string;
  username: string;
}

export interface LogTask {
  _id: string;
  title: string;
}

export interface ActionLogEntry {
  _id: string;
  actionType: 'create' | 'update' | 'delete' | 'smart-assign' | string;
  user?: LogUser | null;
  task?: LogTask | null;
  createdAt?: string;
}

/* ------------ Component ------------- */
const ActionLog: React.FC = () => {
  const { currentRoom } = useContext(RoomContext);      // null ⇒ personal board
  const [logs, setLogs] = useState<ActionLogEntry[]>([]);

  /* load + socket listeners */
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

  /* fetch helper */
  const loadLogs = async () => {
    const endpoint = currentRoom ? `/logs/rooms/${currentRoom}` : '/logs';
    const { data } = await api.get<ActionLogEntry[]>(endpoint);
    setLogs(data);
  };

  /* render */
  return (
    <div className="action-log">
      <h3>Recent Actions</h3>
      <ul>
        {logs.map(log => (
          <li key={log._id}>
            <strong>{log.actionType}</strong> by{' '}
            {log.user?.username ?? 'Unknown'} on task{' '}
            {log.task?.title ?? 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActionLog;
