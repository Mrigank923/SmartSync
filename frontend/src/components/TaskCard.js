import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onSmartAssign, onDelete }) => {
  const dragStart = (e) => {
    e.dataTransfer.setData('id', task._id);
  };

  return (
    <div
      className={`task-card priority-${task.priority.toLowerCase()}`}
      draggable
      onDragStart={dragStart}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p className="priority">{task.priority}</p>
      <div className="card-actions">
        <button onClick={() => onEdit(task)}>✏️ Edit</button>
        <button onClick={() => onSmartAssign(task)}>🤖 Smart Assign</button>
        <button onClick={() => onDelete(task)}>🗑️ Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
