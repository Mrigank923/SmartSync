import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task }) => {
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
    </div>
  );
};

export default TaskCard;
