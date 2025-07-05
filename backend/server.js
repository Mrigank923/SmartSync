require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const startCleanUnverifiedJob = require('./cron/cleanUnverified');

startCleanUnverifiedJob();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// DB + server
mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch(err => console.error(err));


