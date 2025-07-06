import React, { useState, useEffect } from 'react';
import './TaskModal.css';
import api from '../services/api';
import Toast from './Toast';
import ConflictModal from './ConflictModal';

const TaskModal = ({ isOpen, onClose, initialTask, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [toast, setToast] = useState(null);
  const [conflictData, setConflictData] = useState(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Todo');
    }
  }, [initialTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialTask) {
        await api.put(`/tasks/${initialTask._id}`, {
          title, description, priority, status, updatedAt: initialTask.updatedAt
        });
        setToast({ message: 'Task updated!', type: 'success' });
      } else {
        await api.post('/tasks', { title, description, priority, status });
        setToast({ message: 'Task created!', type: 'success' });
      }
      onSave();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        const serverTask = err.response.data.serverVersion;
        const clientTask = err.response.data.clientVersion;
        setConflictData({
            serverTask,
            clientTask
        });
        } else {
        setToast({ message: err.response?.data?.message || 'Operation failed', type: 'error' });
        }

    }
  };

  const handleMerge = async () => {
    try {
        await api.put(`/tasks/${initialTask._id}`, {
        ...conflictData.serverTask,
        updatedAt: conflictData.serverTask.updatedAt
        });
        setToast({ message: 'Server version kept (merged)!', type: 'success' });
        setConflictData(null);
        onSave();
        onClose();
    } catch (err) {
        setToast({ message: 'Merge failed', type: 'error' });
    }
    };


 const handleOverwrite = async () => {
    try {
        await api.put(`/tasks/${initialTask._id}`, {
        ...conflictData.clientTask,
        updatedAt: conflictData.serverTask.updatedAt
        });
        setToast({ message: 'Your version overwrote server!', type: 'success' });
        setConflictData(null);
        onSave();
        onClose();
    } catch (err) {
        setToast({ message: 'Overwrite failed', type: 'error' });
    }
    };


  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {conflictData ? (
        <ConflictModal
          serverVersion={conflictData.serverTask}
          clientVersion={conflictData.clientTask}
          onMerge={handleMerge}
          onOverwrite={handleOverwrite}
          onCancel={() => setConflictData(null)}
        />
      ) : (
        <div className="modal-content">
          <h3>{initialTask ? 'Edit Task' : 'Add Task'}</h3>
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder=" "
              />
              <label>Title</label>
            </div>

            <div className="form-group">
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
                placeholder=" "
              />
              <label>Description</label>
            </div>

            <div className="form-group">
              <label className="static-label"></label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="static-label"></label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="submit">{initialTask ? '💾 Save' : '➕ Add'}</button>
              <button type="button" onClick={onClose} className="cancel-btn">❌ Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskModal;
