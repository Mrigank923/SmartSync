import React, { useState, useEffect } from 'react';
import './TaskModal.css';
import api from '../../services/api';
import Toast from '../Toast';
import ConflictModal from '../conflict/ConflictModal';

const TaskModal = ({ isOpen, onClose, initialTask, onSave, selectedRoom }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [assignedUser, setAssignedUser] = useState('');
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [conflictData, setConflictData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      
      // If selectedRoom is passed from KanbanBoard, use it
      if (selectedRoom) {
        setRoomId(selectedRoom);
      } else {
        setRoomId(''); // Personal task
      }
    }
  }, [isOpen, selectedRoom]);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'Medium');
      setStatus(initialTask.status || 'Todo');
      setAssignedUser(initialTask.assignedUser || '');
      
      // For existing tasks, use their roomId unless we're in a different context
      if (selectedRoom) {
        setRoomId(selectedRoom);
      } else {
        setRoomId(initialTask.roomId?._id || initialTask.roomId || '');
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Todo');
      setAssignedUser('');
      
      // For new tasks, use the selectedRoom from KanbanBoard
      setRoomId(selectedRoom || '');
    }
  }, [initialTask, selectedRoom]);

  const loadUsers = async () => {
    try {
      // Only load users if we're in a room context
      if (selectedRoom) {
        const response = await api.get('/rooms/members');
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taskData = {
        title,
        description,
        priority,
        status,
        assignedUser: roomId ? (assignedUser || null) : null, // Only set assignedUser if room is selected
        roomId: roomId || null
      };

      if (initialTask) {
        await api.put(`/tasks/${initialTask._id}`, {
          ...taskData,
          updatedAt: initialTask.updatedAt
        });
        setToast({ message: 'Task updated!', type: 'success' });
      } else {
        await api.post('/tasks', taskData);
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
        setToast({ 
          message: err.response?.data?.message || 'Operation failed', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
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
                disabled={loading}
              />
              <label>Title</label>
            </div>

            <div className="form-group">
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
                placeholder=" "
                disabled={loading}
              />
              <label>Description</label>
            </div>

            <div className="form-group">
              <label className="static-label">Priority</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="static-label">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Show Assign To only if a room is selected */}
            {roomId && (
              <div className="form-group">
                <label className="static-label">Assign To (Optional)</label>
                <select 
                  value={assignedUser} 
                  onChange={e => setAssignedUser(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (initialTask ? '💾 Save' : '➕ Add')}
              </button>
              <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskModal;
