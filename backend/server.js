// server.js
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const dotenv     = require('dotenv');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { initSocket } = require('./config/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ---- 1. Middleware ----
app.use(cors());
app.use(express.json());

// ---- 2. Swagger Documentation ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SmartSync API Documentation'
}));

// ---- 3. Routes ----
app.use('/api/auth',  require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/logs',  require('./routes/logRoutes'));

// ---- 4. Error handler (last) ----
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ---- 5. Connect DB ----
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ---- 6. Socket.IO ----
const io = initSocket(server); // attach socket to server

// Register socket listeners
require('./sockets/taskSockets')(io);     // joinRoom, leaveRoom
require('./sockets/roomSockets')(io);     // (optional namespace)


// ---- 7. Start Server ----
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
