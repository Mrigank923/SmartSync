// sockets/roomSockets.js
/**
 * Optional dedicated namespace `/room`
 * Clients connect with:
 *   const ns = io('/room', { auth: { token } });
 *   ns.emit('join', roomId);
 */
const jwt   = require('jsonwebtoken');

module.exports = (io) => {
  const roomNs = io.of('/room');

  // Middleware: verify JWT if provided
  roomNs.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      }
      next();
    } catch (err) { next(new Error('Auth error')); }
  });

  roomNs.on('connection', (socket) => {
    console.log('📡  [/room] connected', socket.id);

    socket.on('join', (roomId) => {
      socket.join(roomId);
      console.log(`📡  ${socket.id} joined ${roomId} namespace`);
    });

    socket.on('leave', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('📡  [/room] disconnected', socket.id);
    });
  });
};
