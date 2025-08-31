import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { socket } from '../../services/socket';
import TaskCard from '../task/TaskCard';
import './KanbanBoard.css';
import TaskModal from '../task/TaskModal';
import Toast from '../Toast';
import { useAuth } from '../../context/AuthContext';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initial room check from URL
    const params = new URLSearchParams(window.location.search);
    const roomIdFromUrl = params.get('room');
    
    if (roomIdFromUrl) {
      console.log('Found room ID in URL:', roomIdFromUrl);
      setSelectedRoom(roomIdFromUrl);
    }
    
    loadTasks();
    loadRooms();
    
    // Socket connection for general events
    socket.on('task:update', () => {
      console.log('Received task:update event');
      loadTasks();
    });
    
    socket.on('task:create', () => {
      console.log('Received task:create event');
      loadTasks();
    });
    
    socket.on('task:delete', () => {
      console.log('Received task:delete event');
      loadTasks();
    });
    
    return () => {
      socket.off('task:update');
      socket.off('task:create');
      socket.off('task:delete');
    };
  }, []);

  // Add a separate useEffect to handle room-specific socket connections
  useEffect(() => {
    if (selectedRoom) {
      console.log(`Joining room socket for room: ${selectedRoom}`);
      
      // Join the room's socket channel
      socket.emit('joinRoom', selectedRoom);
      
      // Listen for room-specific events
      socket.on('room:update', (data) => {
        console.log('Room update event:', data);
        loadTasks();
      });
      
      socket.on('task:assignedInRoom', (data) => {
        console.log('Task assigned in room:', data);
        loadTasks();
      });
      
      return () => {
        // Leave room when component unmounts or room changes
        socket.emit('leaveRoom', selectedRoom);
        socket.off('room:update');
        socket.off('task:assignedInRoom');
        console.log(`Left room socket for room: ${selectedRoom}`);
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    loadTasks();
    loadRooms();
    
    // Only set up socket listeners if a room is selected
    if (selectedRoom) {
      console.log('Setting up socket listeners for room:', selectedRoom);
      socket.on('task:created', loadTasks);
      socket.on('task:updated', loadTasks);
      socket.on('task:deleted', loadTasks);
      
      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('task:created', loadTasks);
        socket.off('task:updated', loadTasks);
        socket.off('task:deleted', loadTasks);
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      console.log('Selected room changed to:', selectedRoom);
      console.log('Available rooms:', rooms);
      const currentRoom = rooms.find(room => room._id === selectedRoom);
      console.log('Current room data:', currentRoom);
    }
  }, [selectedRoom, rooms]);

  const loadTasks = async () => {
    try {
      const params = selectedRoom ? { roomId: selectedRoom } : {};
      const res = await api.get('/tasks', { params });
      console.log('Loaded tasks:', res.data); // Debug log
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setToast({ message: 'Failed to load tasks', type: 'error' });
    }
  };

  const loadRooms = async () => {
    try {
      console.log('Loading rooms for dropdown...');
      const response = await api.get('/rooms/my');
      console.log('Rooms loaded:', response.data);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      // Set empty array instead of showing error
      setRooms([]);
    }
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    const task = tasks.find(t => t._id === id);
    if (task && task.status !== status) {
      try {
        await api.put(`/tasks/${id}`, { 
          status, 
          updatedAt: task.updatedAt 
        });
        
        // If in a room context, emit a socket event
        if (selectedRoom) {
          socket.emit('taskUpdatedInRoom', { 
            taskId: id, 
            roomId: selectedRoom,
            status
          });
        }
        
        loadTasks();
      } catch (error) {
        setToast({ message: 'Failed to update task status', type: 'error' });
      }
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const handleSmartAssign = async (task) => {
    try {
      await api.post(`/tasks/${task._id}/smart-assign`);
      setToast({ message: 'Smart assign successful!', type: 'success' });
      
      // For personal tasks, manually refresh
      if (!selectedRoom) {
        loadTasks();
      }
    } catch (error) {
      setToast({ message: 'Smart assign failed', type: 'error' });
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      try {
        await api.delete(`/tasks/${task._id}`);
        setToast({ message: 'Task deleted successfully', type: 'success' });
        
        // For personal tasks, manually refresh
        if (!selectedRoom) {
          loadTasks();
        }
      } catch (error) {
        setToast({ message: 'Failed to delete task', type: 'error' });
      }
    }
  };

  // Filter tasks based on selected room
  const filteredTasks = tasks.filter(task => {
    if (selectedRoom) {
      // Show tasks that belong to the selected room
      return task.roomId && task.roomId._id === selectedRoom;
    } else {
      // Show personal tasks (no roomId)
      return !task.roomId;
    }
  });

  console.log('Filtered tasks:', filteredTasks); // Debug log

  return (
    <div className="kanban-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="kanban-header">
        <div className="kanban-title">
          {selectedRoom ? (
            <h2>
              {rooms.find(room => room._id === selectedRoom)?.name || 
                (rooms.length > 0 ? 'Select a Room' : 'Loading rooms...')}
            </h2>
          ) : (
            <h2>Personal Tasks</h2>
          )}
        </div>
        
        <div className="kanban-actions">
          <button className="add-task-btn" onClick={() => {
            setEditTask(null);
            setShowModal(true);
          }}>➕ Add Task</button>
          
          <div className="room-filter">
            <select 
              value={selectedRoom} 
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">Personal Tasks</option>
              {rooms.length > 0 ? (
                rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading rooms...</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="kanban-board">
        {['Todo', 'In Progress', 'Done'].map(status => (
          <div
            key={status}
            className="kanban-column"
            onDrop={e => handleDrop(e, status)}
            onDragOver={allowDrop}
          >
            <h3>{status}</h3>
            {filteredTasks
              .filter(t => t.status === status)
              .map(t => (
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
        selectedRoom={selectedRoom}  // Pass the selected room to TaskModal
      />
    </div>
  );
};

export default KanbanBoard;