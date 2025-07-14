// config/socket.js
const { Server } = require('socket.io');
let io;                // will hold the singleton instance

/**
 * Initialise Socket.IO and set up global middlewares / helpers.
 * Call this once in server.js *after* you create the HTTP server.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Optional middleware – attach userId from JWT (if provided)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    // TODO: verify token if you need auth on sockets
    socket.userId = token ? /* decode token here */ null : null;
    next();
  });

  io.on('connection', (socket) => {
    console.log('🔌  New socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌  Socket disconnected:', socket.id);
    });
  });

  return io;
};

/** Helper to fetch the already‑initialised io instance anywhere. */
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised!');
  return io;
};

module.exports = { initSocket, getIO };
