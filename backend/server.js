require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const logRoutes = require('./routes/logs');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes(io));
app.use('/api/logs', logRoutes);
// DB + server
mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch(err => console.error(err));

io.on('connection', (socket) => {
  console.log('Client connected: ' + socket.id);
  socket.on('disconnect', () => console.log('Client disconnected: ' + socket.id));
});
