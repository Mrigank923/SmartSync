import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import TaskCard from './TaskCard';
import './KanbanBoard.css';
import TaskModal from './TaskModal';
import Toast from './Toast';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState(null);

 
  useEffect(() => {
    loadTasks();
    socket.on('task:created', loadTasks);
    socket.on('task:updated', loadTasks);
    socket.on('task:deleted', loadTasks);
    return () => {
      socket.off('task:created', loadTasks);
      socket.off('task:updated', loadTasks);
      socket.off('task:deleted', loadTasks);
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
     
      await api.put(`/tasks/${id}`, { status, updatedAt: task.updatedAt });
    }
  };


  const allowDrop = (e) => e.preventDefault();

  const handleSmartAssign = async (task) => {
    try {
      await api.post(`/tasks/${task._id}/smart-assign`);
        setToast({ message: 'Smart assign successful!', type: 'success' });
    } catch {
      setToast({ message: 'Smart assign failed', type: 'error' });
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      await api.delete(`/tasks/${task._id}`);
    }
  };

//   const renderColumn = (status) => (
//     <div
//       className="kanban-column"
//       onDrop={(e) => handleDrop(e, status)}
//       onDragOver={allowDrop}
//     >
//       <h3>{status}</h3>
//       {tasks.filter(t => t.status === status).map(task => (
//         <TaskCard key={task._id} task={task} />
//       ))}
//     </div>
//   );

  return (
    <div className="kanban-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <button className="add-task-btn" onClick={() => {
        setEditTask(null);
        setShowModal(true);
      }}>➕ Add Task</button>
      <div className="kanban-board">
        {['Todo', 'In Progress', 'Done'].map(status => (
          <div
            key={status}
            className="kanban-column"
            onDrop={e => handleDrop(e, status)}
            onDragOver={allowDrop}
          >
            <h3>{status}</h3>
            {tasks.filter(t => t.status === status).map(t => (
              <TaskCard
                key={t._id}
                task={t}
                onEdit={(task) => {
                  setEditTask(task);
                  setShowModal(true);
                }}
                onSmartAssign={handleSmartAssign}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))}
      </div>
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialTask={editTask}
        onSave={loadTasks}
      />
    </div>
  );
};

export default KanbanBoard;