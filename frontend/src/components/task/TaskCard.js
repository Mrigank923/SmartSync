import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onSmartAssign, onDelete }) => {
  const dragStart = (e) => {
    e.dataTransfer.setData('id', task._id);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Todo': return 'todo';
      case 'In Progress': return 'in-progress';
      case 'Done': return 'done';
      default: return 'todo';
    }
  };

  // Check if task is a personal task (no roomId)
  const isPersonalTask = !task.roomId;

  return (
    <div
      className={`task-card priority-${getPriorityColor(task.priority)}`}
      draggable
      onDragStart={dragStart}
    >
      <div className="task-header">
        <h4>{task.title}</h4>
        <div className="task-badges">
          <span className={`priority-badge priority-${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`status-badge status-${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="description">{task.description}</p>
      )}
      
      <div className="task-meta">
        {task.assignedUser && (
          <p className="assigned-user">
            👤 <strong>{task.assignedUser.username || task.assignedUser.name || 'Unknown'}</strong>
          </p>
        )}
        
        {task.roomId && (
          <p className="room-info">
            🏠 <strong>{task.roomId.name || 'Room'}</strong>
          </p>
        )}
        
        {task.createdAt && (
          <p className="created-date">
            📅 {new Date(task.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="card-actions">
        <button onClick={() => onEdit(task)} title="Edit Task">
          ✏️
        </button>
        
        {/* Only show Smart Assign button for room tasks, not personal tasks */}
        {!isPersonalTask && (
          <button onClick={() => onSmartAssign(task)} title="Smart Assign">
            🤖
          </button>
        )}
        
        <button onClick={() => onDelete(task)} title="Delete Task">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
