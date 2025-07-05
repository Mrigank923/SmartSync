import React, { useState } from 'react';
import api from '../services/api';
import './TaskForm.css';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', { title, description, priority });
      onTaskCreated(res.data);  // Notify parent if needed
      setTitle('');
      setDescription('');
      setPriority('Medium');
    } catch (err) {
      alert(err.response?.data?.message || 'Task creation failed');
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Create New Task</h3>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        rows="3"
      />
      <select value={priority} onChange={e => setPriority(e.target.value)}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
