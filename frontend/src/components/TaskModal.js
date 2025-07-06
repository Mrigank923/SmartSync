import React, { useState, useEffect } from 'react';
import './TaskModal.css';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, initialTask, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');

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
        alert('Task updated!');
      } else {
        await api.post('/tasks', { title, description, priority, status });
        alert('Task created!');
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{initialTask ? 'Edit Task' : 'Add Task'}</h3>
        <form onSubmit={handleSubmit}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <div className="modal-actions">
            <button type="submit">{initialTask ? '💾 Save' : '➕ Add'}</button>
            <button type="button" onClick={onClose} className="cancel-btn">❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
