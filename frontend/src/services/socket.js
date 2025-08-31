import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

// Main socket connection
export const socket = io(SOCKET_URL);

// Function to connect to room namespace
export const connectToRoomNamespace = (roomId, token) => {
  const roomSocket = io(`${SOCKET_URL}/room`, {
    auth: { token }
  });
  
  roomSocket.emit('join', roomId);
  console.log(`Connected to room namespace for room: ${roomId}`);
  
  return roomSocket;
};
