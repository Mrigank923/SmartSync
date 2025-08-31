import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../Toast';
import './RoomManager.css';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingRequests, setPendingRequests] = useState({});

  const { token, user } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      console.log('Attempting to load rooms...');
      const response = await api.get('/rooms/my');
      console.log('Rooms loaded successfully:', response.data);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 404) {
          // If 404, set empty rooms array rather than showing an error
          console.log('No rooms found for this user');
          setRooms([]);
        } else if (error.response.status === 401) {
          setToast({ message: 'Authentication error. Please log in again.', type: 'error' });
        } else {
          setToast({ 
            message: error.response.data?.message || `Server error: ${error.response.status}`, 
            type: 'error' 
          });
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setToast({ message: 'No response from server. Check your connection.', type: 'error' });
      } else {
        console.error('Error message:', error.message);
        setToast({ message: `Error: ${error.message}`, type: 'error' });
      }
    }
  };

  const loadPendingRequests = async () => {
    try {
      // First, get rooms where you're the owner
      const ownedRooms = rooms.filter(room => {
        // Compare strings, not objects
        console.log('Room owner check:', room._id, room.owner._id || room.owner, user._id);
        const roomOwnerId = typeof room.owner === 'object' ? room.owner._id : room.owner;
        return roomOwnerId === user._id;
      });
      
      console.log('Owned rooms:', ownedRooms);
      
      // For each owned room, fetch pending requests
      const requests = {};
      
      for (const room of ownedRooms) {
        console.log('Fetching pending requests for room:', room._id);
        // This is correct - fetch the specific room with ID
        const response = await api.get(`/rooms/${room._id}`);
        console.log('Room details response:', response.data);
        
        if (response.data.pending && response.data.pending.length > 0) {
          console.log('Found pending requests:', response.data.pending);
          requests[room._id] = response.data.pending;
        }
      }
      
      console.log('Final pending requests object:', requests);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  useEffect(() => {
    if (rooms.length > 0) {
      loadPendingRequests();
    }
  }, [rooms]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rooms', {
        name: roomName,
        description: roomDescription
      });
      setToast({ message: 'Room created successfully!', type: 'success' });
      setRoomName('');
      setRoomDescription('');
      setShowCreateModal(false);
      loadRooms();
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Failed to create room', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rooms/join', { code: joinCode });
      setToast({ message: 'Joined room successfully!', type: 'success' });
      setJoinCode('');
      setShowJoinModal(false);
      loadRooms();
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Failed to join room', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      try {
        await api.delete(`/rooms/${roomId}/leave`);
        setToast({ message: 'Left room successfully', type: 'success' });
        loadRooms();
      } catch (error) {
        setToast({ message: 'Failed to leave room', type: 'error' });
      }
    }
  };

  const handleEnterRoom = (roomId) => {
    // Join the socket room before navigating
    socket.emit('joinRoom', roomId);
    console.log(`Joined socket room: ${roomId}`);
    
    // Store the room ID in localStorage for persistence
    localStorage.setItem('currentRoomId', roomId);
    
    // Navigate to the Kanban board
    window.location.href = `/kanban?room=${roomId}`;
  };

  const handleRequestAction = async (roomId, userId, approve = true) => {
    try {
      console.log(`Processing request: roomId=${roomId}, userId=${userId}, approve=${approve}`);
      
      // Send the approval/rejection to the backend
      await api.patch(`/rooms/${roomId}/approve`, {
        userId,
        approve
      });
      
      setToast({ 
        message: approve ? 'User approved successfully' : 'Request rejected', 
        type: 'success' 
      });
      
      // Update the UI by removing the processed request
      setPendingRequests(prev => {
        const updated = { ...prev };
        
        // Remove this user from the pending list
        if (updated[roomId]) {
          updated[roomId] = updated[roomId].filter(user => 
            typeof user === 'object' ? user._id !== userId : user !== userId
          );
          
          // If no more pending requests for this room, remove the room entry
          if (updated[roomId].length === 0) {
            delete updated[roomId];
          }
        }
        
        return updated;
      });
      
      // Refresh rooms to show updated member count
      loadRooms();
    } catch (error) {
      console.error('Failed to process request:', error);
      setToast({ 
        message: error.response?.data?.message || 'Failed to process request', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="room-manager">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="room-header">
        <h2>Room Management</h2>
        <div className="room-actions">
          <button onClick={() => setShowCreateModal(true)} className="create-btn">
            ➕ Create Room
          </button>
          <button onClick={() => setShowJoinModal(true)} className="join-btn">
            🔗 Join Room
          </button>
        </div>
      </div>

      <div className="rooms-grid">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-info">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="room-meta">
                  <span>👥 {room.members?.length || 0} members</span>
                  <span>🔑 Code: {room.code}</span>
                </div>
              </div>
              <div className="room-actions">
                <button 
                  onClick={() => handleEnterRoom(room._id)}
                  className="enter-btn"
                >
                  🚪 Enter
                </button>
                <button 
                  onClick={() => handleLeaveRoom(room._id)}
                  className="leave-btn"
                >
                  ❌ Leave
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-rooms-message">
            <div className="empty-state">
              <span className="empty-icon">🏠</span>
              <h3>No Rooms Found</h3>
              <p>You haven't joined any rooms yet. Create a new room or join an existing one using the buttons above.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pending Join Requests Section */}
      {Object.keys(pendingRequests).length > 0 && (
        <div className="pending-requests-section">
          <h3>Pending Join Requests</h3>
          <div className="pending-requests">
            {Object.entries(pendingRequests).map(([roomId, users]) => {
              const room = rooms.find(r => r._id === roomId);
              return (
                <div key={roomId} className="room-requests">
                  <h4>{room?.name || 'Unknown Room'}</h4>
                  <div className="requests-list">
                    {users.map(user => (
                      <div key={user._id} className="request-item">
                        <div className="user-info">
                          <span className="username">{user.username}</span>
                        </div>
                        <div className="request-actions">
                          <button 
                            onClick={() => handleRequestAction(roomId, user._id, true)}
                            className="approve-btn"
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => handleRequestAction(roomId, user._id, false)}
                            className="reject-btn"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Create New Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room name"
                  required
                  disabled={loading}
                />
                <label>Room Name</label>
              </div>
              <div className="form-group">
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Room description"
                  rows="3"
                  disabled={loading}
                />
                <label>Description</label>
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Join Room</h3>
            <form onSubmit={handleJoinRoom}>
              <div className="form-group">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter room code"
                  required
                  disabled={loading}
                />
                <label>Room Code</label>
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowJoinModal(false)}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
