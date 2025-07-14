// sockets/taskSockets.js
/**
 * Minimal helper listeners so the front‑end can:
 *  • socket.emit('joinPersonal', userId)   ⇒ room = userId
 *  • socket.emit('joinRoom',   roomId)
 *  • socket.emit('leaveRoom',  roomId)
 *
 * Controllers then broadcast with:
 *   getIO().to(roomId).emit(...)
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌  Socket connected:', socket.id);


    socket.on('joinRoom', (roomId) => {
      if (roomId) {
        socket.join(roomId.toString());
        console.log(`🏠  ${socket.id} joined room ${roomId}`);
      }
    });

    socket.on('leaveRoom', (roomId) => {
      if (roomId) {
        socket.leave(roomId.toString());
        console.log(`🚪  ${socket.id} left room ${roomId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌  Socket disconnected:', socket.id);
    });
  });
};
