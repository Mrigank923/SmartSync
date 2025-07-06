import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import TaskCard from './TaskCard';
import './KanbanBoard.css';
import TaskForm from './TaskForm';
import ConflictModal from './ConflictModal';


const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [conflict, setConflict] = useState(null);
  useEffect(() => {
    loadTasks();

    socket.on('task:created', (task) => setTasks(prev => [...prev, task]));
    socket.on('task:updated', (updated) =>
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))
    );
    socket.on('task:deleted', ({ id }) =>
      setTasks(prev => prev.filter(t => t._id !== id))
    );

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, []);

  const loadTasks = async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    const task = tasks.find(t => t._id === id);
    if (task.status !== status) {
       try {
      await api.put(`/tasks/${id}`, { status, updatedAt: task.updatedAt });
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict({
          server: err.response.data.serverVersion,
          client: { ...task, status }
        });
      } else {
        console.error(err);
      }
    }
    }
  };


  const allowDrop = (e) => e.preventDefault();

  const renderColumn = (status) => (
    <div
      className="kanban-column"
      onDrop={(e) => handleDrop(e, status)}
      onDragOver={allowDrop}
    >
      <h3>{status}</h3>
      {tasks.filter(t => t.status === status).map(task => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );

  return (
    <div className="kanban-container">
      <TaskForm onTaskCreated={(newTask) => setTasks(prev => [...prev, newTask])} />
      <div className="kanban-board">
        {renderColumn('Todo')}
        {renderColumn('In Progress')}
        {renderColumn('Done')}
      </div>
      {conflict && (
  <ConflictModal
    serverVersion={conflict.server}
    clientVersion={conflict.client}
    onResolve={async (action) => {
      if (action === 'overwrite') {
        try {
          await api.put(`/tasks/${conflict.client._id}`, {
            ...conflict.client,
            updatedAt: conflict.server.updatedAt
          });
        } catch (e) {
          console.error("Failed to overwrite:", e);
        }
      }
      // Handle merge or cancel as needed
      setConflict(null);
    }}
  />
)}

    </div>
  );
};

export default KanbanBoard;
