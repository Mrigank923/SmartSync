const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: null,required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,required: false },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null,required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
